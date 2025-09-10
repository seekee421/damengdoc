package com.dameng.docs.service;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.vladsch.flexmark.html.HtmlRenderer;
import com.vladsch.flexmark.parser.Parser;
import com.vladsch.flexmark.util.ast.Node;
import com.vladsch.flexmark.util.data.MutableDataSet;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

/**
 * PDF转换服务
 * 负责将Markdown文件转换为PDF格式
 */
@Slf4j
@Service
public class PdfConversionService {

    private final Parser parser;
    private final HtmlRenderer renderer;

    public PdfConversionService() {
        MutableDataSet options = new MutableDataSet();
        this.parser = Parser.builder(options).build();
        this.renderer = HtmlRenderer.builder(options).build();
    }

    /**
     * 将单个Markdown文件转换为PDF
     *
     * @param markdownFilePath Markdown文件路径
     * @return PDF字节数组
     * @throws IOException 文件读取或转换异常
     */
    public byte[] convertMarkdownToPdf(String markdownFilePath) throws IOException {
        log.info("开始转换Markdown文件到PDF: {}", markdownFilePath);
        
        // 读取Markdown文件内容
        Path path = Paths.get(markdownFilePath);
        if (!Files.exists(path)) {
            throw new IOException("Markdown文件不存在: " + markdownFilePath);
        }
        
        String markdownContent = Files.readString(path);
        return convertMarkdownContentToPdf(markdownContent, extractTitle(markdownFilePath));
    }

    /**
     * 将多个Markdown文件合并转换为单个PDF
     *
     * @param markdownFilePaths Markdown文件路径列表
     * @return PDF字节数组
     * @throws IOException 文件读取或转换异常
     */
    public byte[] convertMultipleMarkdownToPdf(List<String> markdownFilePaths) throws IOException {
        log.info("开始转换多个Markdown文件到PDF，文件数量: {}", markdownFilePaths.size());
        
        StringBuilder combinedMarkdown = new StringBuilder();
        
        for (int i = 0; i < markdownFilePaths.size(); i++) {
            String filePath = markdownFilePaths.get(i);
            Path path = Paths.get(filePath);
            
            if (!Files.exists(path)) {
                log.warn("跳过不存在的文件: {}", filePath);
                continue;
            }
            
            String content = Files.readString(path);
            String title = extractTitle(filePath);
            
            // 添加章节标题
            combinedMarkdown.append("# ").append(title).append("\n\n");
            combinedMarkdown.append(content);
            
            // 如果不是最后一个文件，添加分页符
            if (i < markdownFilePaths.size() - 1) {
                combinedMarkdown.append("\n\n<div style=\"page-break-after: always;\"></div>\n\n");
            }
        }
        
        return convertMarkdownContentToPdf(combinedMarkdown.toString(), "合并文档");
    }

    /**
     * 将Markdown内容转换为PDF
     *
     * @param markdownContent Markdown内容
     * @param title 文档标题
     * @return PDF字节数组
     * @throws IOException 转换异常
     */
    private byte[] convertMarkdownContentToPdf(String markdownContent, String title) throws IOException {
        try {
            // 解析Markdown为AST
            Node document = parser.parse(markdownContent);
            
            // 渲染为HTML
            String htmlContent = renderer.render(document);
            
            // 包装HTML内容
            String fullHtml = wrapHtmlContent(htmlContent, title);
            
            // 转换为PDF
            return convertHtmlToPdf(fullHtml);
            
        } catch (Exception e) {
            log.error("转换Markdown到PDF时发生错误", e);
            throw new IOException("PDF转换失败: " + e.getMessage(), e);
        }
    }

    /**
     * 包装HTML内容，添加样式和结构
     *
     * @param htmlContent HTML内容
     * @param title 文档标题
     * @return 完整的HTML文档
     */
    private String wrapHtmlContent(String htmlContent, String title) {
        return "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "    <meta charset=\"UTF-8\">\n" +
                "    <title>" + title + "</title>\n" +
                "    <style>\n" +
                "        body {\n" +
                "            font-family: 'Microsoft YaHei', 'SimSun', Arial, sans-serif;\n" +
                "            line-height: 1.6;\n" +
                "            margin: 40px;\n" +
                "            color: #333;\n" +
                "        }\n" +
                "        h1, h2, h3, h4, h5, h6 {\n" +
                "            color: #2c3e50;\n" +
                "            margin-top: 24px;\n" +
                "            margin-bottom: 16px;\n" +
                "        }\n" +
                "        h1 { font-size: 28px; border-bottom: 2px solid #3498db; padding-bottom: 8px; }\n" +
                "        h2 { font-size: 24px; }\n" +
                "        h3 { font-size: 20px; }\n" +
                "        p { margin-bottom: 16px; }\n" +
                "        code {\n" +
                "            background-color: #f8f9fa;\n" +
                "            padding: 2px 4px;\n" +
                "            border-radius: 3px;\n" +
                "            font-family: 'Courier New', monospace;\n" +
                "        }\n" +
                "        pre {\n" +
                "            background-color: #f8f9fa;\n" +
                "            padding: 16px;\n" +
                "            border-radius: 6px;\n" +
                "            overflow-x: auto;\n" +
                "            border-left: 4px solid #3498db;\n" +
                "        }\n" +
                "        table {\n" +
                "            border-collapse: collapse;\n" +
                "            width: 100%;\n" +
                "            margin-bottom: 16px;\n" +
                "        }\n" +
                "        th, td {\n" +
                "            border: 1px solid #ddd;\n" +
                "            padding: 8px 12px;\n" +
                "            text-align: left;\n" +
                "        }\n" +
                "        th {\n" +
                "            background-color: #f2f2f2;\n" +
                "            font-weight: bold;\n" +
                "        }\n" +
                "        blockquote {\n" +
                "            border-left: 4px solid #3498db;\n" +
                "            margin: 16px 0;\n" +
                "            padding-left: 16px;\n" +
                "            color: #666;\n" +
                "        }\n" +
                "        ul, ol { margin-bottom: 16px; }\n" +
                "        li { margin-bottom: 4px; }\n" +
                "        @page {\n" +
                "            margin: 2cm;\n" +
                "            @bottom-right {\n" +
                "                content: counter(page);\n" +
                "            }\n" +
                "        }\n" +
                "    </style>\n" +
                "</head>\n" +
                "<body>\n" +
                htmlContent +
                "</body>\n" +
                "</html>";
    }

    /**
     * 将HTML转换为PDF
     *
     * @param htmlContent HTML内容
     * @return PDF字节数组
     * @throws IOException 转换异常
     */
    private byte[] convertHtmlToPdf(String htmlContent) throws IOException {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.withHtmlContent(htmlContent, null);
            builder.toStream(outputStream);
            builder.run();
            
            return outputStream.toByteArray();
        }
    }

    /**
     * 从文件路径提取标题
     *
     * @param filePath 文件路径
     * @return 文件标题
     */
    private String extractTitle(String filePath) {
        Path path = Paths.get(filePath);
        String fileName = path.getFileName().toString();
        
        // 移除.md扩展名
        if (fileName.endsWith(".md")) {
            fileName = fileName.substring(0, fileName.length() - 3);
        }
        
        return fileName;
    }
}
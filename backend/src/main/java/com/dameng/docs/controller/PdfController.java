package com.dameng.docs.controller;

import com.dameng.docs.service.PdfConversionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * PDF转换控制器
 * 提供Markdown文件转PDF的API接口
 */
@Slf4j
@RestController
@RequestMapping("/api/pdf")
@RequiredArgsConstructor
@Tag(name = "PDF转换", description = "Markdown文件转PDF相关接口")
public class PdfController {

    private final PdfConversionService pdfConversionService;

    /**
     * 转换单个Markdown文件为PDF
     *
     * @param filePath Markdown文件路径
     * @return PDF文件
     */
    @PostMapping("/convert-single")
    @Operation(summary = "转换单个Markdown文件为PDF", description = "将指定的Markdown文件转换为PDF格式")
    public ResponseEntity<ByteArrayResource> convertSingleFile(
            @Parameter(description = "Markdown文件路径", required = true)
            @RequestParam String filePath) {
        
        try {
            log.info("接收到单文件PDF转换请求: {}", filePath);
            
            // 转换为PDF
            byte[] pdfBytes = pdfConversionService.convertMarkdownToPdf(filePath);
            
            // 生成文件名
            String fileName = generateFileName(extractFileNameFromPath(filePath));
            
            return createPdfResponse(pdfBytes, fileName);
            
        } catch (IOException e) {
            log.error("转换PDF时发生错误: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("处理PDF转换请求时发生未知错误", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 转换多个Markdown文件为单个PDF
     *
     * @param request 包含文件路径列表的请求
     * @return 合并的PDF文件
     */
    @PostMapping("/convert-multiple")
    @Operation(summary = "转换多个Markdown文件为PDF", description = "将多个Markdown文件合并转换为单个PDF")
    public ResponseEntity<ByteArrayResource> convertMultipleFiles(
            @RequestBody MultipleFilesRequest request) {
        
        try {
            log.info("接收到多文件PDF转换请求，文件数量: {}", request.getFilePaths().size());
            
            if (request.getFilePaths() == null || request.getFilePaths().isEmpty()) {
                log.warn("文件路径列表为空");
                return ResponseEntity.badRequest().build();
            }
            
            // 转换为PDF
            byte[] pdfBytes = pdfConversionService.convertMultipleMarkdownToPdf(request.getFilePaths());
            
            // 生成文件名
            String fileName = generateFileName("合并文档");
            
            return createPdfResponse(pdfBytes, fileName);
            
        } catch (IOException e) {
            log.error("转换PDF时发生错误: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("处理PDF转换请求时发生未知错误", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 获取可用的Markdown文件列表
     *
     * @return 文件列表
     */
    @GetMapping("/available-files")
    @Operation(summary = "获取可用的Markdown文件列表", description = "返回docs目录下所有可用的Markdown文件")
    public ResponseEntity<List<MarkdownFileInfo>> getAvailableFiles() {
        try {
            // 这里应该扫描docs目录，返回所有.md文件的信息
            log.info("获取可用Markdown文件列表");
            return ResponseEntity.ok(List.of());
        } catch (Exception e) {
            log.error("获取文件列表时发生错误", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 创建PDF响应
     *
     * @param pdfBytes PDF字节数组
     * @param fileName 文件名
     * @return ResponseEntity
     */
    private ResponseEntity<ByteArrayResource> createPdfResponse(byte[] pdfBytes, String fileName) {
        ByteArrayResource resource = new ByteArrayResource(pdfBytes);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                        "attachment; filename*=UTF-8''" + URLEncoder.encode(fileName, StandardCharsets.UTF_8))
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdfBytes.length)
                .body(resource);
    }

    /**
     * 生成PDF文件名
     *
     * @param baseName 基础名称
     * @return 完整文件名
     */
    private String generateFileName(String baseName) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        return baseName + "_" + timestamp + ".pdf";
    }

    /**
     * 从文件路径提取文件名
     *
     * @param filePath 文件路径
     * @return 文件名（不含扩展名）
     */
    private String extractFileNameFromPath(String filePath) {
        String fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
        if (fileName.endsWith(".md")) {
            fileName = fileName.substring(0, fileName.length() - 3);
        }
        return fileName;
    }

    /**
     * 多文件转换请求DTO
     */
    public static class MultipleFilesRequest {
        private List<String> filePaths;

        public List<String> getFilePaths() {
            return filePaths;
        }

        public void setFilePaths(List<String> filePaths) {
            this.filePaths = filePaths;
        }
    }

    /**
     * Markdown文件信息DTO
     */
    public static class MarkdownFileInfo {
        private String path;
        private String name;
        private String title;
        private long size;
        private String lastModified;

        // Getters and Setters
        public String getPath() { return path; }
        public void setPath(String path) { this.path = path; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public long getSize() { return size; }
        public void setSize(long size) { this.size = size; }
        
        public String getLastModified() { return lastModified; }
        public void setLastModified(String lastModified) { this.lastModified = lastModified; }
    }
}
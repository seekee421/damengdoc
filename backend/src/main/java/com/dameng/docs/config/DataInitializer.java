package com.dameng.docs.config;

import com.dameng.docs.entity.User;
import com.dameng.docs.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * 数据初始化器
 * 在应用启动时创建默认的管理员用户
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initializeAdminUser();
    }

    /**
     * 初始化管理员用户
     */
    private void initializeAdminUser() {
        try {
            // 检查是否已存在管理员用户
            if (userRepository.existsByUsername("admin")) {
                logger.info("管理员用户已存在，跳过初始化");
                return;
            }

            // 创建默认管理员用户
            User adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setEmail("admin@dameng.com");
            adminUser.setPassword(passwordEncoder.encode("admin123"));
            adminUser.setRealName("系统管理员");
            adminUser.setStatus(User.UserStatus.ACTIVE);
            adminUser.addRole(User.Role.ADMIN);
            adminUser.addRole(User.Role.USER);
            adminUser.setCreatedAt(LocalDateTime.now());
            adminUser.setUpdatedAt(LocalDateTime.now());

            userRepository.save(adminUser);
            logger.info("默认管理员用户创建成功: username=admin, password=admin123");

        } catch (Exception e) {
            logger.error("初始化管理员用户失败: {}", e.getMessage(), e);
        }
    }
}
package com.dameng.docs.service;

import com.dameng.docs.entity.User;
import com.dameng.docs.repository.UserRepository;
import com.dameng.docs.dto.UserRegisterRequest;
import com.dameng.docs.dto.UserResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * 用户登录认证
     */
    public User authenticateUser(String usernameOrEmail, String password) {
        // 查找用户
        Optional<User> userOpt = userRepository.findByUsernameOrEmail(usernameOrEmail);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("用户不存在");
        }
        
        User user = userOpt.get();
        
        // 检查用户状态
        if (user.getStatus() != User.UserStatus.ACTIVE) {
            throw new RuntimeException("用户账号已被禁用");
        }
        
        // 验证密码
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("密码错误");
        }
        
        // 更新最后登录时间
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        
        return user;
    }

    /**
     * 用户注册
     */
    public UserResponse registerUser(UserRegisterRequest request) {
        // 检查用户名是否已存在
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }

        // 检查邮箱是否已存在
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("邮箱已存在");
        }

        // 创建新用户
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRealName(request.getRealName());
        user.setPhone(request.getPhone());
        user.setStatus(User.UserStatus.ACTIVE);
        user.addRole(User.Role.USER);

        // 保存用户
        User savedUser = userRepository.save(user);
        return UserResponse.from(savedUser);
    }

    /**
     * 根据用户名或邮箱查找用户
     */
    public Optional<User> findByUsernameOrEmail(String usernameOrEmail) {
        return userRepository.findByUsernameOrEmail(usernameOrEmail);
    }

    /**
     * 根据ID查找用户
     */
    public Optional<UserResponse> findById(Long id) {
        return userRepository.findById(id)
                .map(this::convertToUserResponse);
    }

    /**
     * 获取所有活跃用户
     */
    public List<UserResponse> findActiveUsers() {
        return userRepository.findByStatus(User.UserStatus.ACTIVE)
                .stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
    }

    /**
     * 更新用户最后登录时间
     */
    public void updateLastLoginTime(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);
        });
    }

    /**
     * 检查用户名是否可用
     */
    public boolean isUsernameAvailable(String username) {
        return !userRepository.existsByUsername(username);
    }

    /**
     * 检查邮箱是否可用
     */
    public boolean isEmailAvailable(String email) {
        return !userRepository.existsByEmail(email);
    }

    /**
     * 统计活跃用户数量
     */
    public long countActiveUsers() {
        return userRepository.countByStatus(User.UserStatus.ACTIVE);
    }

    /**
     * 转换User实体为UserResponse
     */
    private UserResponse convertToUserResponse(User user) {
        return UserResponse.from(user);
    }
}
package com.dameng.docs.controller;

import com.dameng.docs.dto.UserRegisterRequest;
import com.dameng.docs.dto.UserLoginRequest;
import com.dameng.docs.dto.UserResponse;
import com.dameng.docs.entity.User;
import com.dameng.docs.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserRegisterRequest request) {
        try {
            UserResponse userResponse = userService.registerUser(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "注册成功");
            response.put("user", userResponse);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserLoginRequest request) {
        try {
            // 验证用户登录
            User user = userService.authenticateUser(request.getUsernameOrEmail(), request.getPassword());
            
            // 创建响应
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "登录成功");
            response.put("user", UserResponse.from(user));
            // TODO: 后续添加JWT token
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * 检查用户名是否可用
     */
    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsername(@RequestParam String username) {
        boolean available = userService.isUsernameAvailable(username);
        
        Map<String, Object> response = new HashMap<>();
        response.put("available", available);
        response.put("message", available ? "用户名可用" : "用户名已存在");
        
        return ResponseEntity.ok(response);
    }

    /**
     * 检查邮箱是否可用
     */
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        boolean available = userService.isEmailAvailable(email);
        
        Map<String, Object> response = new HashMap<>();
        response.put("available", available);
        response.put("message", available ? "邮箱可用" : "邮箱已存在");
        
        return ResponseEntity.ok(response);
    }

    /**
     * 获取用户统计信息
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        long activeUserCount = userService.countActiveUsers();
        
        Map<String, Object> response = new HashMap<>();
        response.put("activeUsers", activeUserCount);
        response.put("message", "统计信息获取成功");
        
        return ResponseEntity.ok(response);
    }
}
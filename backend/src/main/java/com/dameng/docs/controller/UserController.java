package com.dameng.docs.controller;

import com.dameng.docs.dto.UserResponse;
import com.dameng.docs.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * 获取用户信息
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            Optional<UserResponse> userResponse = userService.findById(id);
            if (userResponse.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("user", userResponse.get());
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "用户不存在");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "获取用户信息失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * 获取所有活跃用户列表
     */
    @GetMapping("/active")
    public ResponseEntity<?> getActiveUsers() {
        try {
            List<UserResponse> users = userService.findActiveUsers();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("users", users);
            response.put("total", users.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "获取用户列表失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * 获取用户统计信息
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getUserStats() {
        try {
            long activeUserCount = userService.countActiveUsers();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("activeUserCount", activeUserCount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "获取统计信息失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
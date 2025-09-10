package com.dameng.docs.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UserRegisterRequest {

    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 50, message = "用户名长度必须在3-50个字符之间")
    private String username;

    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 100, message = "密码长度必须在6-100个字符之间")
    private String password;

    @Size(max = 100, message = "真实姓名长度不能超过100个字符")
    private String realName;

    @Size(max = 20, message = "手机号长度不能超过20个字符")
    private String phone;

    // 构造函数
    public UserRegisterRequest() {}

    public UserRegisterRequest(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    // 验证方法
    public boolean isValid() {
        return username != null && !username.trim().isEmpty() &&
               email != null && !email.trim().isEmpty() &&
               password != null && !password.trim().isEmpty();
    }

    // Getter和Setter方法
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRealName() {
        return realName;
    }

    public void setRealName(String realName) {
        this.realName = realName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    @Override
    public String toString() {
        return "UserRegisterRequest{" +
                "username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", realName='" + realName + '\'' +
                ", phone='" + phone + '\'' +
                '}';
    }
}
package com.dameng.docs.dto;

import jakarta.validation.constraints.NotBlank;

public class UserLoginRequest {

    @NotBlank(message = "用户名或邮箱不能为空")
    private String usernameOrEmail;

    @NotBlank(message = "密码不能为空")
    private String password;

    // 构造函数
    public UserLoginRequest() {}

    public UserLoginRequest(String usernameOrEmail, String password) {
        this.usernameOrEmail = usernameOrEmail;
        this.password = password;
    }

    // Getter和Setter方法
    public String getUsernameOrEmail() {
        return usernameOrEmail;
    }

    public void setUsernameOrEmail(String usernameOrEmail) {
        this.usernameOrEmail = usernameOrEmail;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public String toString() {
        return "UserLoginRequest{" +
                "usernameOrEmail='" + usernameOrEmail + '\'' +
                '}';
    }
}
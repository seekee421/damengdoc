package com.dameng.docs.repository;

import com.dameng.docs.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 根据用户名查找用户
     */
    Optional<User> findByUsername(String username);

    /**
     * 根据邮箱查找用户
     */
    Optional<User> findByEmail(String email);

    /**
     * 根据用户名或邮箱查找用户
     */
    @Query("SELECT u FROM User u WHERE u.username = :usernameOrEmail OR u.email = :usernameOrEmail")
    Optional<User> findByUsernameOrEmail(@Param("usernameOrEmail") String usernameOrEmail);

    /**
     * 检查用户名是否存在
     */
    boolean existsByUsername(String username);

    /**
     * 检查邮箱是否存在
     */
    boolean existsByEmail(String email);

    /**
     * 根据状态查找用户
     */
    List<User> findByStatus(User.UserStatus status);

    /**
     * 根据角色查找用户
     */
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r = :role")
    List<User> findByRole(@Param("role") User.Role role);

    /**
     * 统计活跃用户数量
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.status = 'ACTIVE'")
    long countActiveUsers();

    /**
     * 根据状态统计用户数量
     */
    long countByStatus(User.UserStatus status);
}
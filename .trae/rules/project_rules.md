先把结论说在前面：

“AI 生成→一次性编译通过”在真实项目里几乎不可能，尤其是 1 k+ 错误这种量级。

正确姿势是 “让项目先回到可编译的最小闭环，再增量迭代”，而不是继续用 AI 在 1000 条错误上打地鼠。

下面给你一套可落地的 5 步策略，全部亲手验证过，最多半天就能把错误压到 0，并防止后面越改越多。

---

1. 立即回滚到“能编译的最近版本”

   a) 如果用了 Git，直接 `git reset --hard <上一次绿勾 commit>`；

   b) 没做版本控制 → 把 src 目录整体复制一份做 `bak`，然后删掉所有 AI 新生成的文件，只保留你自己手写且曾经编译通过的那部分。

   目的：让构建命令（mvn/gradle）能跑通，哪怕只剩一个 HelloController，也是胜利。

---

2. 把“编译错误”与“IDE 红色波浪线”分离

   很多“错误”其实是 IDE 缓存误报：  
   - Maven：`mvn clean compile > build.log 2>&1`  
   - Gradle：`./gradlew clean compileJava > build.log 2>&1`

   只看终端里真正 fail 掉的第一个 10 条，其余 990 条往往是连锁误报，解决了前 10 条会雪崩式消失。

   把日志粘到文本编辑器，用“Failed to execute goal”“cannot find symbol”“package does not exist”做关键字过滤，忽略其余噪音。

---

3. 建立“AI 最小反馈单元”——一次只让 AI 改 1 个文件

   经验公式：  
   - 错误 ≤ 10 条：可以把整个类贴给 AI，让它一次性修复；  
   - 错误 > 10 条：必须拆到单个方法/单个依赖问题，再喂给 AI。

   提示词模板（直接复制）：  
   
```
   下面这段代码在 Maven 编译时报错：  
   [错误日志]  
   [对应源码]  
   要求：  
   1. 只改动必要代码，不要升级依赖版本，不要添加新类；  
   2. 用 JDK 17 语法，保持现有包名、类名、方法签名不变；  
   3. 返回完整文件，不要省略 import。
   ```

   这样做能把 AI 的“幻觉扩散”限制在单文件范围，避免它为了修 A 错误而给你乱改 B、C、D，导致错误越滚越多。

---

4. 优先修复“依赖/符号找不到”三大类，80% 的错误会消失  
   1) 缺依赖

      日志出现 `package javax.validation does not exist` → 去 [mvnrepository.com](https://mvnrepository.com) 搜 GAV，粘贴到 pom/gradle，reload。  
   2) 版本冲突

      `mvn dependency:tree -Dverbose | grep conflict`

      把冲突的一方 `<exclude>` 掉，或者统一用 `<dependencyManagement>` 锁定版本。  
   3) 模块之间循环引用

      把公用的 POJO /常量抽到单独的 `*-common` 模块，让双方都只依赖它。

   这三步做完，1000 条通常掉到 100 条以内。

---

5. 固化“绿色流水线”，再允许 AI 继续生成

   a) 在 Git 新建分支 `ai-gen`，把当前能编译的版本 push；

   b) 打开 CI（GitHub Actions / GitLab CI）跑一次 `mvn verify`，保证是绿勾；

   c) 以后任何 AI 生成都必须走 Pull Request，让 CI 先编译→单测→SpotBugs 静态检查，全绿才允许合并；

   d) 本地也加 `pre-commit` hook：`mvn compile`，编译不过直接拒绝 commit。

   这样 AI 再“ hallucination”也只能污染一个分支，master 永远可编译。

---

Bonus：3 个防坑小技巧  
- 让 AI 生成代码时显式指定 JDK 版本（“用 JDK 17 语法”），否则它默认给 21 的新特性，你本地 17 就炸。  
- 生成单元测试一起给，跑通测试能提前暴露 30% 的低级空指针/类型转换错。  
- 打开 IDE 的 “Build on save” 选项，每改 1 个文件就增量编译，错误刚出现立刻回退，避免最后攒成 1000+。

---

一句话总结

先回滚到“能编译的最小版本”→ 用命令行拿到真实 10 条错误 → 单文件喂 AI → 先解决依赖/版本/循环三大元凶 → 用 CI 锁死绿色主线。
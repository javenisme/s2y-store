const { MedusaContainer } = require("@medusajs/medusa")
const { default: UserService } = require("@medusajs/medusa/dist/services/user")
const bcrypt = require("bcrypt")

async function resetAdmin() {
  // 定义新的管理员信息
  const NEW_EMAIL = "javen@s2y.us"
  const NEW_PASSWORD = "click113"
  
  console.log("正在重置管理员凭据...")
  
  // 获取Medusa容器实例
  const container = await MedusaContainer.boot()
  
  // 获取用户服务
  const userService = container.resolve("userService")
  
  try {
    // 查找现有管理员用户
    const users = await userService.list({ role: "admin" }, {})
    
    if (users.length === 0) {
      console.log("找不到管理员用户，将创建一个新管理员")
      
      // 创建管理员用户
      const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10)
      await userService.create({
        email: NEW_EMAIL,
        password: hashedPassword,
        role: "admin",
        first_name: "Admin",
        last_name: "User"
      })
      
      console.log(`已创建新管理员用户：${NEW_EMAIL}，密码：${NEW_PASSWORD}`)
    } else {
      // 更新现有管理员
      const adminUser = users[0]
      const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10)
      
      await userService.update(adminUser.id, {
        email: NEW_EMAIL,
        password: hashedPassword
      })
      
      console.log(`已更新管理员用户 ${adminUser.email} 为 ${NEW_EMAIL}，密码：${NEW_PASSWORD}`)
    }
    
    console.log("重置完成！您现在可以使用新凭据登录：")
    console.log(`邮箱: ${NEW_EMAIL}`)
    console.log(`密码: ${NEW_PASSWORD}`)
    
    process.exit(0)
  } catch (error) {
    console.error("重置过程中出错:", error)
    process.exit(1)
  }
}

resetAdmin() 
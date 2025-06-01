/**
 * 重置Medusa管理员密码脚本
 * 使用方法: npx @medusajs/medusa-cli user -e admin@medusa-test.com -p newpassword123
 * 
 * 以下是脚本的内容，用于在数据库中直接更新密码，以防CLI方法不可用
 */

// 导入依赖
const knex = require("knex")
const bcrypt = require("bcrypt")
const dotenv = require("dotenv")

// 加载环境变量
dotenv.config()

// 数据库配置
const DB_USERNAME = process.env.DB_USERNAME
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_HOST = process.env.DB_HOST || "localhost"
const DB_PORT = process.env.DB_PORT || 5432
const DB_DATABASE = process.env.DB_DATABASE

// 新管理员信息
const ADMIN_EMAIL = "admin@example.com"
const ADMIN_PASSWORD = "password123"

async function resetAdmin() {
  console.log("正在尝试重置管理员密码...")
  
  try {
    // 创建数据库连接
    const connection = knex({
      client: "postgres",
      connection: {
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USERNAME,
        password: DB_PASSWORD,
        database: DB_DATABASE
      }
    })
    
    // 检查连接
    await connection.raw("SELECT 1")
    console.log("数据库连接成功")
    
    // 使用bcrypt加密新密码
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)
    
    // 查找管理员用户
    const users = await connection("user").where("role", "admin")
    
    if (users.length === 0) {
      console.log("找不到管理员用户")
      return
    }
    
    // 更新管理员用户
    const adminUser = users[0]
    await connection("user")
      .where("id", adminUser.id)
      .update({
        email: ADMIN_EMAIL,
        password_hash: hashedPassword
      })
    
    console.log(`已重置管理员账户：`)
    console.log(`邮箱: ${ADMIN_EMAIL}`)
    console.log(`密码: ${ADMIN_PASSWORD}`)
    
    // 关闭连接
    await connection.destroy()
    
  } catch (error) {
    console.error("重置过程中出错:", error)
  }
}

// 显示使用CLI的指南
console.log("=== Medusa管理员密码重置指南 ===")
console.log("方法1: 使用Medusa CLI (推荐)")
console.log("运行以下命令:")
console.log("npx @medusajs/medusa-cli user -e admin@example.com -p password123")
console.log("\n方法2: 运行此脚本")
console.log("如果需要直接运行此脚本，请将文件重命名为reset-admin.js并取消下面的注释")
console.log("然后运行: node reset-admin.js")
console.log("\n注意: 在运行此脚本之前，请确保PostgreSQL数据库正在运行")

// 取消下面的注释以启用脚本直接更新数据库
// resetAdmin() 
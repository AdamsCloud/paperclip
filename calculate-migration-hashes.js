import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 完全按照源码的方式读取文件内容
function readMigrationFileContent(migrationFile) {
  const filePath = path.join(
    __dirname,
    'packages',
    'db',
    'src',
    'migrations',
    migrationFile
  )
  return fs.readFileSync(filePath, 'utf8')
}

// 完全按照源码的方式计算哈希
function calculateHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex')
}

function main() {
  console.log('=== 迁移文件哈希值计算 ===\n')

  try {
    const migrationsDir = path.join(
      __dirname,
      'packages',
      'db',
      'src',
      'migrations'
    )

    // 读取所有迁移文件
    const files = fs.readdirSync(migrationsDir)
    const sqlFiles = files
      .filter((file) => file.endsWith('.sql'))
      .sort((a, b) => {
        const numA = parseInt(a.split('_')[0]) || 0
        const numB = parseInt(b.split('_')[0]) || 0
        return numA - numB
      })

    console.log(`找到 ${sqlFiles.length} 个迁移文件\n`)

    // 计算每个文件的哈希值
    for (const fileName of sqlFiles) {
      const content = readMigrationFileContent(fileName)
      const hash = calculateHash(content)

      console.log(`${fileName}`)
      console.log(`Hash: ${hash}`)
      console.log('---')
    }

    console.log('\n=== 计算完成 ===')
  } catch (error) {
    console.error('计算哈希值时出错:', error)
    process.exit(1)
  }
}

main()

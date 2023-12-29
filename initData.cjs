const fs = require('fs')
const path = require('path')
const os = require('os')
const dayjs = require('dayjs')
const {prompts, generateFile} = require('@umijs/utils')

const parentDir = path.resolve('../')


const dirs = parentDir.split(path.sep)

const groupName = dirs[dirs.length - 1]
const htmlFilePath = path.join('../', groupName + '.html')
const fileExits = fs.existsSync(htmlFilePath)
if(!fileExits) {
    throw new Error('请将文件夹放在导出的聊天记录{群聊名称}.html同级目录下，确保已经导出聊天为html')
}

const htmlFile = fs.readFileSync(htmlFilePath, 'utf-8')


const startStr = 'const chatMessages ='
const startIndex = htmlFile.indexOf(startStr)
const endIndex = htmlFile.indexOf(`function checkEnter(event) {`)
let messagesStr = htmlFile.slice(startIndex + startStr.length, endIndex)
const allMessages = eval(messagesStr);

async function main() {
    const currentYear = dayjs().format('YYYY')
    const yearValue = Number(currentYear)
    const prevYears = [yearValue]
    for (let i = 1; i < 5; i++) {
        prevYears.push(yearValue - i)
    }
    let value = await prompts([
        {
            type: 'select',
            name: 'year',
            message: '选择要生成报告的年份',
            choices: prevYears.map(title => ({title, value: `${title}`})),
        }
    ])

    const messages = allMessages.filter(item => {
        if (item.timestamp) {
            if (dayjs(item.timestamp * 1000).format('YYYY') === value.year) {
                return true
            }
        }
        return false
    })


    const templates = [
        './index.html',
        './src/App.tsx',
        './src/messages.ts',
    ]

    templates.forEach(tpl => {
        generateFile({
            path: tpl + '.tpl',
            target: tpl,
            baseDir: __dirname,
            data: {
                groupName,
                messages: JSON.stringify(messages)
            }
        })
    })
}

main()

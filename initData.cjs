const fs = require('fs')
const path = require('path')
const os = require('os')
const dayjs = require('dayjs')
const weekOfYear = require('dayjs/plugin/weekOfYear')

const {prompts, generateFile, chalk} = require('@umijs/utils')
const nodejieba = require('nodejieba')
require("dayjs/locale/zh-cn");
// config dayjs
dayjs.locale('zh-cn');
dayjs.extend(weekOfYear)

const emojiText = [
    '[',
    ']',
    '微笑',
    '发呆',
    '撇嘴',
    '色',
    '得意',
    '流泪',
    '害羞',
    '闭嘴',
    '睡',
    '大哭',
    '尴尬',
    '发怒',
    '调皮',
    '呲牙',
    '惊讶',
    '难过',
    '抓狂',
    '吐',
    '偷笑',
    '愉快',
    '白',
    '傲慢',
    '困',
    '惊恐',
    '憨笑',
    '悠闲',
    '咒骂',
    '疑问',
    '嘘',
    '晕',
    '衰',
    '骷髅',
    '敲打',
    '再见',
    '擦汗',
    '抠鼻',
    '鼓掌',
    '坏笑',
    '右哼哼',
    '鄙视',
    '委屈',
    '快哭了',
    '阴险',
    '亲亲',
    '可怜',
    '可怜',
    '笑脸',
    '生病',
    '脸红',
    '破涕为笑',
    '恐惧',
    '失望',
    '无语',
    '嘿哈',
    '捂脸',
    '奸笑',
    '机智',
    '皱眉',
    '耶',
    '吃瓜',
    '加油',
    '汗',
    '天啊',
    'Emm',
    '社会社会',
    '旺柴',
    '好的',
    '打脸',
    '哇',
    '翻白眼',
    '666',
    '让我看看',
    '叹气',
    '苦涩',
    '裂开',
    '嘴唇',
    '爱心',
    '心碎',
    '拥抱',
    '强',
    '弱',
    '握手',
    '胜利',
    '抱拳',
    '勾引',
    '拳头',
    'OK',
    '合十',
    '啤酒',
    '咖啡',
    '蛋糕',
    '玫',
    '凋谢',
    '菜刀',
    '炸弹',
    '便便',
    '月亮',
    '太阳',
    '庆祝',
    '礼物',
    '红包',
    '發',
    '福',
    '烟花',
    '爆竹',
    '猪头',
    '跳跳',
    '发抖',
    '转圈',
]


// 生成词汇出现量的排行
function getWordRank(messages) {
    const homedir = os.userInfo().homedir

    const targetDictPath = path.join(homedir, 'weixin-group-annual-report')
    if (!fs.existsSync(targetDictPath)) {
        fs.mkdirSync(targetDictPath)
    }
    const defaultDicts = [
        'DEFAULT_USER_DICT',
        'DEFAULT_DICT',
        'DEFAULT_HMM_DICT',
        'DEFAULT_IDF_DICT',
        'DEFAULT_STOP_WORD_DICT',
    ]

    defaultDicts.forEach(dictPath => {
        const from = nodejieba[dictPath].split('/')
        const fileName = from[from.length - 1]
        const to = path.join(targetDictPath, fileName)
        // nodejieba不识别中文路径，需要复制到临时路径
        fs.copyFileSync(nodejieba[dictPath], to)
    })

    const defaultDict = path.resolve(targetDictPath, 'jieba.dict.utf8')
    const hmmDict = path.resolve(targetDictPath, 'hmm_model.utf8')
    const userDict = path.resolve(targetDictPath, 'user.dict.utf8')
    const idfDict = path.resolve(targetDictPath, 'idf.utf8')
    const stopWordDict = path.resolve(targetDictPath, 'stop_words.utf8')
    const displaynames = [...new Set(messages.map(item => item.displayname))]; //昵称自动加入用户自定义词典
    const customWords = ['外包', '张三', '李四']; //自定义分词词典

    let userDictStr = '';
    [...displaynames, ...customWords].forEach(name => {
        if (name) {
            userDictStr += `\n${name}`
        }
    })

    fs.writeFileSync(userDict, userDictStr.slice(1))
    try {
        nodejieba.load({
            dict: defaultDict,
            hmmDict: hmmDict,
            userDict: userDict,
            idfDict: idfDict,
            stopWordDict: stopWordDict,
        });
    } catch (e) {

    }
    function isChina(s) {
        const reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
        return reg.test(s);
    }
    const stopWords = fs.readFileSync(stopWordDict, 'utf-8').split('\n')
    const wordMap = {};
    for (const message of messages) {
        if (message.type === 1 || message.type === 49 && message.sub_type === 57) {
            let {text = ''} = message
            // 删除表情包
            for (const emoji of emojiText) {
                text = text.replace(new RegExp(`[${emoji}]`, 'gm'), '')
            }
            const txtArr = nodejieba.cut(text)
            for (const textItem of txtArr) {
                if(textItem.length === 1 || !isChina(textItem) || stopWords.includes(textItem)) { // 排除不包含汉字的词汇,排除一个字,排除停用词
                    continue;
                }
                if (!wordMap[textItem]) {
                    wordMap[textItem] = 1
                } else {
                    wordMap[textItem] = wordMap[textItem] + 1
                }
            }
        }
    };
    const wordCountList = Object.keys(wordMap).map(word => ({
        word,
        count:wordMap[word]
    })).sort((a, b) => b.count - a.count)
    return wordCountList
}


async function main() {

    let parentDir = path.resolve('../')
    let dirs = parentDir.split(path.sep)
    let groupName = dirs[dirs.length - 1]
    let htmlFilePath = path.join(parentDir, groupName + '.html')
    const fileExits = fs.existsSync(htmlFilePath)
    if (!fileExits) {
        let customDir = await prompts([
            {
                type: 'text',
                name: 'dir',
                message: '输入导出的群聊html聊天记录目录',
            }
        ])
        parentDir = path.resolve(customDir.dir)
        dirs = parentDir.split(path.sep)
        groupName = dirs[dirs.length - 1]
        htmlFilePath = path.join(parentDir, groupName + '.html')
        if(!fs.existsSync(htmlFilePath)) {
            throw new Error('请输入正确的聊天记录导出目录，或者将文件夹放在导出的聊天记录{群聊名称}.html同级目录下，确保已经导出聊天为html')
        }
    }

    const htmlFile = fs.readFileSync(htmlFilePath, 'utf-8')

    const startStr = 'const chatMessages ='
    const startIndex = htmlFile.indexOf(startStr)
    const endIndex = htmlFile.indexOf(`function checkEnter(event) {`)
    let messagesStr = htmlFile.slice(startIndex + startStr.length, endIndex)
    const allMessages = eval(messagesStr);



    const currentYear = dayjs().format('YYYY')
    const yearValue = Number(currentYear)
    const prevYears = [yearValue]
    for (let i = 1; i < 5; i++) {
        prevYears.push(yearValue - i)
    }
    let value = await prompts([
        {
            type: 'select',
            name: 'range',
            message: '选择要生成报告的时间段',
            choices: [
                {title: '上周', value: 'lastweek'},
                {title: '本周', value: 'week'},
                {title: '上个月', value: 'lastmonth'},
                {title: '本月', value: 'month'},
                ...prevYears.map(title => ({title:`${title}年`, value: `${title}`}))
            ],
        }
    ])

    console.log(chalk.green('正在过滤聊天记录...'))
    let messages;
    let startTime
    let endTime
    let rangeStr
    if(value.range === 'week') {
        startTime = dayjs().startOf('week')
        endTime = dayjs()
        rangeStr = `${startTime.format('YYYY')}年第${startTime.week()}周`
    } else if(value.range === 'lastweek') {
        startTime = dayjs().subtract(1,'week').startOf('week')
        endTime = dayjs().subtract(1,'week').endOf('week')
        rangeStr = `${startTime.format('YYYY')}年第${startTime.week()}周`
    }else if(value.range === 'lastmonth') {
        startTime = dayjs().subtract(1,'month').startOf('month')
        endTime = dayjs().subtract(1,'month').endOf('month')
        rangeStr = `${startTime.format('YYYY')}年${startTime.format('M')}月`
    }else if(value.range === 'month') {
        startTime = dayjs().startOf('month')
        endTime = dayjs()
        rangeStr = `${startTime.format('YYYY')}年${startTime.format('M')}月`
    }
    if(startTime && endTime) {
        messages = allMessages.filter(item => {
            if (item.timestamp) {
                let messageTime = dayjs(item.timestamp * 1000)
                if (messageTime.isAfter(startTime) && messageTime.isBefore(endTime)) {
                    return true
                }
            }
            return false
        })
    } else {
        rangeStr = `${value.range}年`
        messages = allMessages.filter(item => {
            if (item.timestamp) {
                if (dayjs(item.timestamp * 1000).format('YYYY') === value.range) {
                    return true
                }
            }
            return false
        })
    }

    console.log(chalk.green('正在生成词云...'))

    const wordCountList = getWordRank(messages).slice(0, 100)


    const templates = [
        './index.html',
        './src/App.tsx',
        './src/messages.ts',
        './vite.config.ts',
    ]

    await Promise.all(templates.map(tpl => {
        return generateFile({
            path: tpl + '.tpl',
            target: tpl,
            baseDir: __dirname,
            data: {
                groupName,
                rangeStr,
                publicPath: JSON.stringify(parentDir),
                wordCountList: JSON.stringify(wordCountList),
                messages: JSON.stringify(messages)
            }
        })
    }))

    console.log(chalk.green('生成模板完成，执行 npm run dev 运行项目'))
}

main()

import {IMessage, messages, wordCountList} from './messages.ts'
import styles from './App.module.scss'
import UserMsg from "./components/user-msg";
import TimeCenter from "./components/time-center";
import dayjs from 'dayjs'
import WordCloud from "./components/word-cloud";
import {countEmoji, getPerEmojiCount, replaceEmoji} from "./utils";
import User from "./components/user";
import HourRank from "./components/hour-rank";


const groupName = '{{{groupName}}}'

function sortByCountDesc<T extends Record<'count', number>>(ls: T[]): T[] {
    return ls.sort((a, b) => b.count - a.count)
}

// 0 时间 1 文字 3 图片 49/57 引用文字 49/6 文件 43 视频
function countMsgType() {
    let imgCount = 0 // 图片数量
    let gifCount = 0 // 表情包数量
    let textCount = 0 // 文字消息
    let videoCount = 0 // 视频消息
    let fileCount = 0 // 文件消息
    let emojiCount = 0 // 表情
    const dayCountMap: Record<string, number> = {}
    const hourCountMap: Record<string, number> = {}
    const emojiCountMap: Record<string, number> = {}
    const gifCountMap: Record<string, number> = {}
    const messagePersonCountMap: Record<string, { count: number, avatar: string }> = {}
    for (const message of messages) {
        if (message.type === 0) {
            continue
        }
        if (message.displayname) {
            if (!messagePersonCountMap[message.displayname]) {
                messagePersonCountMap[message.displayname] = {
                    count: 1,
                    avatar: message.avatar_path
                }
            } else {
                messagePersonCountMap[message.displayname] = {
                    count: messagePersonCountMap[message.displayname].count + 1,
                    avatar: message.avatar_path
                }
            }
        }


        if (message.timestamp) {
            const timeStamp = message.timestamp * 1000
            const day = dayjs(timeStamp).format('YYYY-MM-DD')
            const hour = dayjs(timeStamp).format('HH')
            if (!dayCountMap[day]) {
                dayCountMap[day] = 1
            } else {
                dayCountMap[day] = dayCountMap[day] + 1
            }
            if (!hourCountMap[hour]) {
                hourCountMap[hour] = 1
            } else {
                hourCountMap[hour] = hourCountMap[hour] + 1
            }
        }
        let textEmojiCount: Record<string, number> = {}
        if (message.type === 1) {
            emojiCount += countEmoji(message.text)
            textEmojiCount = getPerEmojiCount(message.text)
            textCount++
        } else if (message.type === 49) {
            if (message.sub_type === 57) {
                emojiCount += countEmoji(message.text)
                textEmojiCount = getPerEmojiCount(message.text)
                textCount++
            } else if (message.sub_type === 6) {
                fileCount++
            }
        } else if (message.type === 3) {
            if (message.text.startsWith('http')) {
                if (!gifCountMap[message.text]) {
                    gifCountMap[message.text] = 1
                } else {
                    gifCountMap[message.text] = gifCountMap[message.text] + 1
                }
                gifCount++
            } else {
                imgCount++
            }
        } else if (message.type === 43) {
            videoCount++
        }
        Object.keys(textEmojiCount).forEach(emoji => {
            if (!emojiCountMap[emoji]) {
                emojiCountMap[emoji] = 1
            } else {
                emojiCountMap[emoji] = emojiCountMap[emoji] + 1
            }
        })
    }
    return {
        imgCount,
        gifCount,
        textCount,
        videoCount,
        fileCount,
        emojiCount,
        hourCountList: Object.keys(hourCountMap).map(hour => ({
            hour,
            count: hourCountMap[hour]
        })).sort((a, b) => Number(b.hour) - Number(a.hour)),
        dayCountList: sortByCountDesc(Object.keys(dayCountMap).map(day => ({
            day,
            count: dayCountMap[day]
        }))),
        messagePersonCountList: sortByCountDesc(Object.keys(messagePersonCountMap).map(displayname => ({
            displayname,
            count: messagePersonCountMap[displayname].count,
            avatar: messagePersonCountMap[displayname].avatar
        }))),
        allCount: imgCount + gifCount + textCount + videoCount + fileCount,
        emojiCountList: sortByCountDesc(Object.keys(emojiCountMap).map(emoji => ({
            emoji,
            count: emojiCountMap[emoji],
            img: replaceEmoji(emoji)
        }))),
        gifCountList: sortByCountDesc(Object.keys(gifCountMap).map(img => ({
            count: gifCountMap[img],
            img
        }))),
    }
}

const counts = countMsgType()


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export default function App() {

    const topEmojiList = counts.emojiCountList.slice(0, 10)
    const topGifList = counts.gifCountList.slice(0, 10)
    const topMessagePersonList = counts.messagePersonCountList.slice(0, 30); // 显示在排行内的人，取前30名

    const firstMessage = messages.find(({type}) => type !== 0) as IMessage

    return (
        <div className={styles.main}>
            <div className={styles.title}>{groupName}{{{rangeStr}}}报告</div>
            <div className={styles.card}>
                <div className={styles.text}>{groupName}群里一共有<span
                    className={styles.em}>{counts.messagePersonCountList.length}</span>人参与发了<span
                    className={styles.em}>{counts.allCount}</span>条消息
                </div>
                <div className={styles.text}>其中包括：</div>
                <div className={styles.text}><span className={styles.em}>{counts.textCount}</span>条文字消息</div>
                <div className={styles.text}><span className={styles.em}>{counts.imgCount}</span>张图片</div>
                <div className={styles.text}><span className={styles.em}>{counts.gifCount}</span>个表情包</div>
                <div className={styles.text}><span className={styles.em}>{counts.videoCount}</span>个视频</div>
                <div className={styles.text}><span className={styles.em}>{counts.fileCount}</span>个文件</div>
                <div className={styles.text}><span className={styles.em}>{counts.emojiCount}</span>个微信表情</div>
            </div>
            <div className={styles.text}>{{{rangeStr}}}群内第一条消息：</div>
            <TimeCenter message={firstMessage}/>
            <UserMsg message={firstMessage}/>
            <div className={styles.card}>
                <div className={styles.textDesc}>{{{rangeStr}}}有<span className={styles.em}>{counts.dayCountList.length}</span>天都有人群里在发言
                </div>
                <div className={styles.textDesc}>最活跃的一天是<span
                    className={styles.em}>{counts.dayCountList[0].day}</span>，这天群里有<span
                    className={styles.em}>{counts.dayCountList[0].count}</span>条消息，“你们上班还需要工作吗？”
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.textDesc}>群内最常出现的词汇有：</div>
                <WordCloud wordCountList={wordCountList}/>
            </div>
            <div className={styles.card}>
                <div className={styles.textDesc}>各时间段消息数量分布：</div>
                <HourRank hourCountList={counts.hourCountList}/>
            </div>
            <div className={styles.card}>
                <div className={styles.textDesc}>最受欢迎的微信表情是：</div>
                <div className={styles.emojiBig} dangerouslySetInnerHTML={ {__html: counts.emojiCountList[0].img} }></div>
            </div>
            <div className={styles.card}>
                <div className={styles.subtitle}>群内表情欢迎度排行</div>
                <div className={styles.rankHead}>
                    <div>排名</div>
                    <div>数量</div>
                </div>
                <div>
                    {topEmojiList.map((item, index) => <div className={styles.emojiRankItem}>
                        <div className={styles.rankNum}>{index + 1}</div>
                        <div className={styles.emojiImg} dangerouslySetInnerHTML={ {__html: item.img} }></div>
                        <div className={styles.count}>{item.count}</div>
                    </div>)}
                </div>
            </div>
            <div className={styles.card}>
                <div className={styles.textDesc}>最受欢迎的表情包是：</div>
                <div className={styles.gifBig}>
                    <img src={topGifList[0].img} alt=""/>
                </div>
            </div>
            <div className={styles.card}>
                <div className={styles.subtitle}>群内表情包欢迎度排行</div>
                <div className={styles.rankHead}>
                    <div>排名</div>
                    <div>数量</div>
                </div>
                <div>
                    {topGifList.map((item, index) => <div className={styles.gifRankItem}>
                        <div className={styles.rankNum}>{index + 1}</div>
                        <div className={styles.gifImg}>
                            <img src={item.img} alt=""/>
                        </div>
                        <div className={styles.count}>{item.count}</div>
                    </div>)}
                </div>
            </div>
            <div className={styles.card}>
                <div className={styles.textDesc}>{{{rangeStr}}}群里最活跃的人是：</div>
                <br/>
                <User message={ {
                    avatar_path: counts.messagePersonCountList[0].avatar,
                    displayname: counts.messagePersonCountList[0].displayname
                } }/>
                <div className={styles.text}>{{{rangeStr}}}Ta贡献了<span
                    className={styles.em}>{counts.messagePersonCountList[0].count}</span>条群聊消息
                </div>
            </div>
            <div className={styles.card}>
                <div className={styles.subtitle}>群友活跃度排行</div>
                <div>
                    <div className={styles.rankHead}>
                        <div>排名</div>
                        <div>消息数量</div>
                    </div>
                    {topMessagePersonList.map((person, index) => <div className={styles.messageRankItem}>
                        <div className={styles.rankNum}>{index + 1}</div>
                        <User message={ {
                            avatar_path: person.avatar,
                            displayname: person.displayname
                        } }/>
                        <div className={styles.count}>{person.count}</div>
                    </div>)}
                </div>
            </div>
        </div>
    )
}
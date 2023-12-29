import styles from './styles.module.scss'
import cls from 'classnames'

export default function User({message}: {message: {avatar_path: string, displayname: string}}) {
    return <div className={cls(styles.main, 'userItem')}>
        <div className={styles.avatar}><img src={message.avatar_path} alt="" /></div>
        <div className={styles.displayname}>{message.displayname}</div>
    </div>
}
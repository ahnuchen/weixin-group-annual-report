import * as echarts from 'echarts'
import styles from './styles.module.scss'
import {useEffect, useRef} from "react";

interface HourRankProps {
    hourCountList: {hour: string, count: number}[]
}

export default function HourRank({hourCountList}:HourRankProps) {
    const mainRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(!mainRef.current) {
            return
        }

        const chart = echarts.init(mainRef.current)
        chart.setOption({
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            grid: {
                left: '1%',
                right: '7%',
                bottom: '1%',
                top: '3%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'value',
                }
            ],
            yAxis: [
                {
                    type: 'category',
                    data: hourCountList.map(i => `${i.hour}点`),
                    axisTick: {
                        alignWithLabel: true
                    }
                }
            ],
            series: [
                {
                    name: '发言数量',
                    type: 'bar',
                    barWidth: '60%',
                    label: {
                        show: true,
                        position: 'right'
                    },
                    data: hourCountList.map(i => ({
                        value: i.count,
                        itemStyle: {
                            color: '#e21969'
                        }
                    })),
                }
            ]
        })
    }, [mainRef, hourCountList]);
    return <div className={styles.main} ref={mainRef}>

    </div>
}
/* eslint-disable @typescript-eslint/ban-ts-comment */

import styles from './styles.module.scss'
import {useEffect, useRef} from "react";
import cloud from "../../utils/d3.layout.cloud";
import * as d3 from "d3";
function stringToColour (str:string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let colour = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
}
type IWordCountList = {word: string, count: number}[]
export default function WordCloud({wordCountList}: {wordCountList: IWordCountList}) {

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current
        if(!container) {
            return
        }

        container.innerHTML = '';
        
        const {width} = container!.getBoundingClientRect()
        const layout = cloud()
            .size([width, width])
            // @ts-ignore
            .words(wordCountList.map(function (d) {
                return {text: d.word, size: d.count * (70 / wordCountList[0].count)}; // 最大字号70
            }))
            .padding(5)
            .rotate(function () {
                return ~~(Math.random() * 2) * 90;
            })
            .font("Impact")
            .fontSize(function (d: { size: never; }) {
                return d.size;
            })
            .on("end", draw);

        layout.start();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function draw(words: any) {
            d3.select("#wordCloudContainer").append("svg")
                .attr("width", layout.size()[0])
                .attr("height", layout.size()[1])
                .append("g")
                .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
                .selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", function(d) {
                    // @ts-ignore
                    return d.size + "px"; })
                .style("font-family", "Impact")
                .style('fill', function (d) {
                    // @ts-ignore
                    return stringToColour(`${d.text}${d.size}`)
                })
                .attr("text-anchor", "middle")
                .attr("transform", function(d) {
                    // @ts-ignore
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function(d) { // @ts-ignore
                    return d.text; });
        }

    }, [wordCountList,containerRef]);

    return <div className={styles.main} id="wordCloudContainer" ref={containerRef}>

    </div>
}
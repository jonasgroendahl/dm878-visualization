import * as d3 from "d3";
import React, { useEffect, useRef } from "react";
interface IBarChartProps {
  data: { name: string; value: number }[];
  width?: number;
  height?: number;
}

const WIDTH = 1200;
const HEIGHT = 600;

export const BarChart: React.FC<IBarChartProps> = ({
  data,
  width = WIDTH,
  height = HEIGHT,
}) => {
  const ref = useRef<SVGSVGElement>(null);

  // console.log(data);

  useEffect(() => {
    const container = ref.current;

    if (!container) return;

    const svg = d3
      .select(container)
      .attr("height", height)
      .attr("width", width)
      .style("overflow", "visible")
      .style("margin", "50px")
      .style("margin-bottom", "250px")
      .classed("container", true);

    // clear all previous content on refresh
    const everything = svg.selectAll("*");
    everything.remove();

    // scaling

    const xScale = d3
      .scaleBand()
      .domain(data.map((value) => value.name))
      .rangeRound([0, width])
      .padding(0.1);

    // find max to determine domain
    const max = Math.max(...data.map((v) => v.value));

    const yScale = d3
      .scaleLinear()
      .domain([0, max + 10]) // + 10 to make the graph a tiny bit taller than max
      .range([height, 0]);

    // axes

    const xAxis = d3
      .axisBottom(xScale)
      .ticks(data.length)
      .tickFormat((v) => {
        // const largeLetterIndex = v.slice(1).match(/[A-Z]/u);

        // if (largeLetterIndex && largeLetterIndex.index) {
        //   return v.slice(0, largeLetterIndex.index - 1);
        // }

        return v;
      });

    const yAxis = d3.axisLeft(yScale).ticks(5);

    svg
      .append("g")
      .classed("x", true)
      .call(xAxis)
      .attr("transform", `translate(0, ${height})`);
    svg.append("g").call(yAxis);

    const bars = svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .classed("bar", true)
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => height - yScale(d.value))
      //@ts-expect-error not sure
      .attr("x", (d) => xScale(d.name))
      .attr("y", (d) => yScale(d.value))
      .attr("fill", "tomato");

    const labels = svg
      .selectAll(".x text")
      .attr("transform", "rotate(90)")
      .attr("text-anchor", "start")
      .attr("x", 10)
      .attr("y", -5);
  }, [ref, data]);

  return <svg ref={ref} />;
};

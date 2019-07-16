import React, { Component } from 'react';

var DoughnutChart = require("react-chartjs").Doughnut;
var PieChart = require("react-chartjs").Pie;
var LineChart = require("react-chartjs").Line;
var BarChart = require("react-chartjs").Bar;

const ChartsView = ({ candidatesNames, candidatesVotesCount }) => {

  const chartData = {
    labels: candidatesNames,
    datasets: [
      {
        label: "My First dataset",
        fillColor: "rgba(220,220,220,0.2)",
        strokeColor: "rgba(220,220,220,1)",
        data: candidatesVotesCount
      }
    ]
  };

  return <BarChart data={chartData} /*width="600" height="250"*//>
}

export default ChartsView

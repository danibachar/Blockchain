import React, { Component } from 'react';

import { Bar } from 'react-chartjs-2';

const ChartsView = ({ candidatesNames, candidatesVotesCount }) => {

  const chartData = {
    labels: candidatesNames,
    datasets: [
      {
        label: 'Vote Count',
        fillColor: "rgba(220,220,220,0.2)",
        strokeColor: "rgba(220,220,220,1)",
        hoverBackgroundColor: 'rgba(255,99,132,0.4)',
        hoverBorderColor: 'rgba(255,99,132,1)',
        borderWidth: 1,
        data: candidatesVotesCount
      }
    ]
  };
  const options = {
        responsive: true,
        scales: { yAxes: [{ ticks: { beginAtZero: true } }] },
        legend: { position: 'top',},
  }

  return <Bar data={chartData} options={options} /*width={600} height={250}*//>
}

export default ChartsView

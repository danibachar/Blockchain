import React, { Component } from 'react';
import ElectionWeb3 from './ElectionLogic';

var DoughnutChart = require("react-chartjs").Doughnut;
var PieChart = require("react-chartjs").Pie;
var LineChart = require("react-chartjs").Line;
var BarChart = require("react-chartjs").Bar;

var el = new ElectionWeb3()

export default class ChartsView extends Component {
  state = {
		// showLoader: true
	};

	static defaultProps = {
		// canvasId: SCENE_CANVAS_ID
	};

	componentWillMount() {
		const { params } = this.props.match;
    el.initWeb3()
  }

  render() {

    const candidates = ["January", "February", "March", "April", "May", "June", "July"]

		const chartData = {
    	labels: candidates,
    	datasets: [
    		{
    			label: "My First dataset",
    			fillColor: "rgba(220,220,220,0.2)",
    			strokeColor: "rgba(220,220,220,1)",
    			data: [65, 59, 80, 81, 56, 55, 40]
    		}
    	]
    };
    //options={chartOptions}
		return <BarChart data={chartData} /*width="600" height="250"*//>
	}
}

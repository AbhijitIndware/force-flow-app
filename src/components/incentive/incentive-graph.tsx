import React from 'react';
import {LineChart} from 'react-native-gifted-charts';

const IncentiveGraph = () => {
  const data = [{value: 15}, {value: 30}, {value: 26}, {value: 40}];
  return <LineChart areaChart data={data} />;
};

export default IncentiveGraph;

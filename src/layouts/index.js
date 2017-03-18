import _findIndex from 'lodash/findIndex';
import _find from 'lodash/find';
import coinProperties from 'constants/coinProperties';
import {removeFalsy} from 'app/utility';

import pile from './pile';
import scatterLine from './scatterLine';
import plainGrid from './plainGrid';
import scatterPlot from './scatterPlot';
import clusters from './clusters';
import scatterLines from './scatterLines';
import clusterGrid from './clusterGrid';

import coinLayout from './coin';
import introLayout from './intro';

const layouts = [
  pile,
  scatterLine,
  plainGrid,
  scatterPlot,
  clusters,
  clusterGrid,
  {
    key: 'cluster_list',
    value: 'Clusters List',
    requiredTypes: ['discrete'],
    create: pile.create
  },
  scatterLines,
  {
    key: 'nested_grid',
    value: 'Nested Grid',
    requiredTypes: ['discrete', 'continuous'],
    create: pile.create
  }
]

var layouter = {};

function isLayoutApplicable(layout, selectedProperties) {
  var applicable = false,
      requiredTypes = layout.requiredTypes,
      propertiesCheck = requiredTypes.slice(),
      properties = [];

  // lazily create a new array only containing the layouts that are defined
  selectedProperties[0] && properties.push(selectedProperties[0]);
  selectedProperties[1] && properties.push(selectedProperties[1]);

  // if no properties are selected but properties are required, return false
  if(layout.requiredTypes.length !== properties.length)
    return false;

  // no types are required and no properties are selected, return true
  if(properties.length === 0) return true;

  for(var i = 0; i < propertiesCheck.length; i++) {
    var index = propertiesCheck.indexOf(properties[i].type)
    if(index === -1)
      break;
    propertiesCheck[index] = undefined;
    if(i === properties.length-1)
      applicable = true;
  }

  return applicable;
}

function getCoinsBounds(coins) {
  var bounds = {top: Infinity, right: -Infinity, bottom: -Infinity, left: Infinity};

  coins.forEach(function(coin) {
    bounds.top = coin.y < bounds.top ? coin.y : bounds.top;
    bounds.right = coin.x > bounds.right ? coin.x : bounds.right;
    bounds.bottom = coin.y > bounds.bottom ? coin.y : bounds.bottom;
    bounds.left = coin.x < bounds.top ? coin.x : bounds.top;
  });
  return bounds;
}

layouter.getLayouts = function() {
  return layouts;
}


layouter.update = function(coins, state, bounds) {
  var layout = state.selectedLayout,
      properties = removeFalsy(state.selectedProperties);

/*  if(state.onboardingState === 0) {
    introLayout.create(coins, state, bounds, coinsBounds);
  }*/

  if(state.selectedCoin !== null)
    coinLayout.create(coins, state, bounds);
  else
    layout.create(coins, properties, bounds, state);

}

/*
  Returns the default layout for the given selected properties. If there is 
  already a layout selected check if it is still applicable. If not, return first applicable layout.
*/
layouter.getApplicableLayout = function(state) {
  var selectedLayout = state.selectedLayout,
      applicableLayouts = layouter.getApplicableLayouts(state.selectedProperties);

  if(isLayoutApplicable(selectedLayout, state.selectedProperties))
    return selectedLayout;

  return applicableLayouts[0];
}


/*
  Returns a list of applicable layouts given a set of selected properties
*/
layouter.getApplicableLayouts = function(properties) {
  var applicableLayouts = [];

  layouts.forEach(function(layout) {
    var applicable = isLayoutApplicable(layout, properties);
    if(applicable) 
      applicableLayouts.push(layout);
  });
  return applicableLayouts;
}

export default layouter;
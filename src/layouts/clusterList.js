import {randomNormal as d3_randomNormal} from 'd3-random';
import {groupDiscrete} from 'app/utility';
import {COIN_HEIGHT} from 'constants';
import {max as d3_max} from 'd3-array';

export default {
  key: 'cluster_list',
  value: 'Cluster List',
  description: 'The coins are grouped into piles which are then sorted by amount of coins.',
  requiredTypes: ['discrete'],
  create: function plainGrid(coins, properties, bounds) {
    const centerY = bounds.top + bounds.height/2;
    const propertyKey = properties[0].key;
    const groups = groupDiscrete(coins, propertyKey);
    const positions = [];
    const labelGroups = [{key: propertyKey, labels: []}];
    const visibleBounds = {top: Infinity, left: Infinity, bottom: -Infinity, right: -Infinity};
    const SHOW_TOP_N = 6;
    let lastBounds;
    let x;
    let y;
    const maxGroupSize = d3_max(groups, (group) => group.coins.length);


    groups.forEach(({coins, key}, groupIndex) => {
      let groupBounds = {top: Infinity, bottom: -Infinity, right: -Infinity};
      const lastEnd = groupIndex > 0 ? lastBounds.right : bounds.left;
      const radius = Math.sqrt(coins.length) * 6;
      const groupX = lastEnd + radius * 2 + 100 + d3_randomNormal(0, 5)();
      const groupY = centerY + d3_randomNormal(0, 5)();

      if(groupIndex === SHOW_TOP_N) visibleBounds.right = groupX;

      coins.forEach((coin) => {
        y = d3_randomNormal(groupY, radius/2)() - COIN_HEIGHT/2;
        x = d3_randomNormal(groupX, radius/2)() - COIN_HEIGHT/2;
        positions.push({x, y});
        coin.move(x, y);
        // update bounds for next group positioning
        groupBounds.top = y < groupBounds.top ? y : groupBounds.top;
        groupBounds.bottom = y > groupBounds.bottom ? y : groupBounds.bottom;
        groupBounds.right = x > groupBounds.right ? x : groupBounds.right;

        // Get the bounds of the groups that should be in viewport
        if(groupIndex < SHOW_TOP_N) {
          visibleBounds.top = y < visibleBounds.top ? y : visibleBounds.top;
          visibleBounds.left = x < visibleBounds.left ? x : visibleBounds.left;
          visibleBounds.right = x > visibleBounds.right ? x : visibleBounds.right;
          visibleBounds.bottom = y > visibleBounds.bottom ? y : visibleBounds.bottom;
        }
      });

      // if only few coins in group make position alternate between top/bottom
      const lowCountPos = groupIndex % 2 === 0 ? groupBounds.top - 20 : groupBounds.bottom + COIN_HEIGHT + 20;

      labelGroups[0].labels.push({
        value: key,
        key: propertyKey,
        x: groupX,
        y: coins.length < 12 ? lowCountPos : groupY,
        minZoom: .6 - coins.length / maxGroupSize,
        selectable: true,
        alignment: ['center', 'center']
      });

      lastBounds = groupBounds;
    });

    return {positions, labelGroups, bounds: visibleBounds};
  }
}
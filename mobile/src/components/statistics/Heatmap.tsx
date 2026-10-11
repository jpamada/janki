import {
  bucketColor,
  computeHeatmapWeeks,
  type HeatmapDay,
} from '@/helpers/logsHeatmap.helper';

import {
  Text,
  View,
  Pressable,
  type LayoutChangeEvent,
} from 'react-native';

import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { CELL_GAP, COLUMNS } from '@/constants/heatmapConsts';
import { addMonths, subMonths, format } from 'date-fns';
import { useColorScheme } from 'nativewind';
import { useMemo, Fragment, useState } from 'react';

type HeatmapGridProps = {
  weeks: HeatmapDay[][];
  cellSize: number;
  width: number;
  height: number;
  onLayout: (event: LayoutChangeEvent) => void;
  onRendered: () => void;
};

function HeatmapGrid({
  weeks,
  width,
  height,
  cellSize,
  onLayout,
  onRendered,
}: HeatmapGridProps) {
  const { colorScheme } = useColorScheme();
  const isLight = colorScheme === 'light';

  return (
    <View
      onLayout={onLayout}
      style={{
        width,
        height,
        overflow: 'hidden',
      }}
    >
      <Svg
        width={width}
        height={height}
        onLayout={onRendered}
      >
        {weeks.map((week, weekIndex) =>
          week.map((day, dayIndex) => (
            <Fragment key={day.date || `${weekIndex}-${dayIndex}`}>
              <Rect
                x={dayIndex * (cellSize + CELL_GAP)}
                y={weekIndex * (cellSize + CELL_GAP)}
                width={cellSize}
                height={cellSize}
                rx={6}
                fill={bucketColor(day.count, day.inMonth, isLight)}
              />

              {day.inMonth && (
                <SvgText
                  x={dayIndex * (cellSize + CELL_GAP) + cellSize / 2}
                  y={weekIndex * (cellSize + CELL_GAP) + cellSize / 2 + 4}
                  fontSize={Math.max(cellSize * 0.32, 9)}
                  fill={day.count > 0 ? '#fff' : '#9ca3af'}
                  textAnchor="middle"
                >
                  {day.dayNumber}
                </SvgText>
              )}
            </Fragment>
          ))
        )}
      </Svg>
    </View>
  );
}

type HeatmapRow = {
  day: string;
  count: number | string;
};

type HeatmapProps = {
  rows: HeatmapRow[];
  isPending: boolean;
  viewDate: Date;
  onViewDateChange: (updater: (date: Date) => Date) => void;
  gridStart: Date;
  gridEnd: Date;
  monthStart: Date;
  containerWidth: number;
  onLayout: (event: LayoutChangeEvent) => void;
};

export default function Heatmap({
  rows,
  isPending = true,
  viewDate,
  onViewDateChange,
  gridStart,
  gridEnd,
  monthStart,
  containerWidth,
  onLayout,
}: HeatmapProps) {
  const [isHeatMapRendered, setIsHeatMapRendered] = useState(false);

  const weeks = useMemo(
    () => computeHeatmapWeeks(rows, gridStart, gridEnd, monthStart),
    [rows, gridStart, gridEnd, monthStart],
  );

  const cellSize =
    containerWidth > 0
      ? (containerWidth - CELL_GAP * (COLUMNS - 1)) / COLUMNS
      : 0;

  const width = containerWidth;
  const height =
    cellSize > 0
      ? weeks.length * (cellSize + CELL_GAP) - CELL_GAP
      : 0;

  const hasValidDimensions =
    containerWidth > 0 &&
    cellSize > 0 &&
    width > 0 &&
    height > 0 &&
    weeks.length > 0;


  return (
    <View className="gap-3 rounded-xl" onLayout={onLayout}>
      <View className="flex flex-row items-center justify-between">
        <Text className="text-gray-600 text-lg font-bold dark:text-neutral-300">
          Summary
        </Text>

        <View className="flex-row items-center justify-end gap-2">
          <Pressable
            onPress={() => onViewDateChange((date) => subMonths(date, 1))}
            className="
              rounded-full p-2
              bg-gray-50 active:bg-gray-100
              dark:bg-neutral-800 dark:active:bg-neutral-700
            "
          >
            <ChevronLeft size={20} color="#4b5563" />
          </Pressable>

          <Text className="text-gray-700 text-base font-semibold dark:text-neutral-300">
            {format(viewDate, 'MMMM yyyy')}
          </Text>

          <Pressable
            onPress={() => onViewDateChange((date) => addMonths(date, 1))}
            className="
              rounded-full p-2
              bg-gray-50 active:bg-gray-100
              dark:bg-neutral-800 dark:active:bg-neutral-700
            "
          >
            <ChevronRight size={20} color="#4b5563" />
          </Pressable>
        </View>
      </View>

      <View
        style={{
          width: containerWidth > 0 ? width : '100%',
          height: hasValidDimensions ? height : 240,
          overflow: 'hidden',
        }}
        className="rounded-xl"
      >
        {hasValidDimensions && (
          <HeatmapGrid
            weeks={weeks}
            cellSize={cellSize}
            width={width}
            height={height}
            onLayout={onLayout}
            onRendered={() => setIsHeatMapRendered(true)}
          />
        )}

        {!isHeatMapRendered && (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1,
            }}
            className="bg-gray-50 dark:bg-neutral-800"
          />
        )}
      </View>
    </View>
  );
}
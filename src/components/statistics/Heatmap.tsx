import { type HeatmapDay, bucketColor, computeHeatmapWeeks } from '@/helpers/logsHeatmap.helper';
import { type LayoutChangeEvent, Text, View, Pressable } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { CELL_GAP, COLUMNS } from '@/constants/heatmapConsts';
import { addMonths, subMonths, format } from 'date-fns';
import { useMemo, Fragment, useState } from 'react';
import { useColorScheme } from 'nativewind';

type HeatmapGridProps = {
  weeks: HeatmapDay[][];
  cellSize: number;
  width: number;
  height: number;
  onRendered: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
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
        width: width,
        height: height,
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
                rx={6}
                width={cellSize}
                height={cellSize}
                x={dayIndex * (cellSize + CELL_GAP)}
                y={weekIndex * (cellSize + CELL_GAP)}
                fill={bucketColor(day.count, day.inMonth, isLight)}
              />

              {day.inMonth && (
                <SvgText
                  textAnchor="middle"
                  fontSize={Math.max(cellSize * 0.32, 9)}
                  fill={day.count > 0 ? '#fff' : '#9ca3af'}
                  x={dayIndex * (cellSize + CELL_GAP) + cellSize / 2}
                  y={weekIndex * (cellSize + CELL_GAP) + cellSize / 2 + 4}
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
  gridEnd: Date;
  viewDate: Date;
  gridStart: Date;
  monthStart: Date;
  containerWidth: number;
  onLayout: (event: LayoutChangeEvent) => void;
  onViewDateChange: (updater: (date: Date) => Date) => void;
};

export default function Heatmap({
  rows,
  gridEnd,
  viewDate,
  gridStart,
  monthStart,
  containerWidth,
  onLayout,
  onViewDateChange,
}: HeatmapProps) {
  const [isHeatMapRendered, setIsHeatMapRendered] = useState(false);

  const weeks = useMemo(
    () => computeHeatmapWeeks(rows, gridStart, gridEnd, monthStart),
    [rows, gridStart, gridEnd, monthStart],
  );

  const cellSize = containerWidth > 0
    ? (containerWidth - CELL_GAP * (COLUMNS - 1)) / COLUMNS
    : 0;

  const width = containerWidth;

  const height = cellSize > 0
    ? weeks.length * (cellSize + CELL_GAP) - CELL_GAP
    : 0;

  const hasValidDimensions = 
    containerWidth > 0 &&
    weeks.length > 0 &&
    cellSize > 0 &&
    width > 0 &&
    height > 0;

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
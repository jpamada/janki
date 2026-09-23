import { addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, format } from 'date-fns';
import { bucketColor, computeHeatmapWeeks, type HeatmapDay } from '@/helpers/logsHeatmap.helper';
import { useCallback, useEffect, useMemo, useState, Fragment } from 'react';
import { Text, View, Pressable, LayoutChangeEvent } from 'react-native';
import { getReviewHeatmapData } from '@/repositories/logs.repository';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { useQuery } from '@tanstack/react-query';

const CELL_GAP = 4;
const COLUMNS = 7;

type ReviewHeatmapProps = {
  onLoadingChange?: (isPending: boolean) => void;
};

type HeatmapGridProps = {
  weeks: HeatmapDay[][];
  cellSize: number;
  width: number;
  height: number;
  onLayout: (event: LayoutChangeEvent) => void;
};

function HeatmapGrid({ 
  weeks, 
  width, 
  height, 
  cellSize, 
  onLayout 
}: HeatmapGridProps) {
  return (
    <View onLayout={onLayout}>
      {cellSize > 0 && (
        <Svg width={width} height={height}>
          {weeks.map((week, weekIndex) =>
            week.map((day, dayIndex) => (
              <Fragment key={day.date || `${weekIndex}-${dayIndex}`}>
                <Rect
                  x={dayIndex * (cellSize + CELL_GAP)}
                  y={weekIndex * (cellSize + CELL_GAP)}
                  width={cellSize}
                  height={cellSize}
                  rx={6}
                  fill={bucketColor(day.count, day.inMonth)}
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
      )}
    </View>
  );
}

export default function ReviewHeatmap({ onLoadingChange }: ReviewHeatmapProps) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [containerWidth, setContainerWidth] = useState(0);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  }, []);

  const monthStart = useMemo(() => startOfMonth(viewDate), [viewDate]);
  const monthEnd = useMemo(() => endOfMonth(viewDate), [viewDate]);
  const gridStart = useMemo(() => startOfWeek(monthStart), [monthStart]);
  const gridEnd = useMemo(() => endOfWeek(monthEnd), [monthEnd]);

  const { data: rows = [], isPending } = useQuery({
    queryKey: ['reviewHeatmap', format(monthStart, 'yyyy-MM')],
    queryFn: () => getReviewHeatmapData(gridStart, gridEnd),
  });

  useEffect(() => {
    onLoadingChange?.(isPending);
  }, [isPending, onLoadingChange]);

  const weeks = useMemo(
    () => computeHeatmapWeeks(rows, gridStart, gridEnd, monthStart),
    [rows, gridStart, gridEnd, monthStart],
  );

  const cellSize = containerWidth > 0
    ? (containerWidth - CELL_GAP * (COLUMNS - 1)) / COLUMNS
    : 0;

  const width = containerWidth;
  const height = weeks.length * (cellSize + CELL_GAP) - CELL_GAP;

  return (
    <View className="gap-3 rounded-xl py-6">
      <View className='flex flex-row items-center justify-between'>
        <Text className='text-gray-600 text-lg font-bold'>Summary</Text>

        <View className="flex-row items-center justify-end gap-2">
          <Pressable
            onPress={() => setViewDate((d) => subMonths(d, 1))}
            className="p-2 bg-gray-50 rounded-full active:bg-gray-100"
          >
            <ChevronLeft size={20} color="#4b5563" />
          </Pressable>

          <Text className="text-base font-semibold text-gray-700">
            {format(viewDate, 'MMMM yyyy')}
          </Text>

          <Pressable
            onPress={() => setViewDate((d) => addMonths(d, 1))}
            className="p-2 bg-gray-50 rounded-full active:bg-gray-100"
          >
            <ChevronRight size={20} color="#4b5563" />
          </Pressable>
        </View>
      </View>

      <HeatmapGrid
        weeks={weeks}
        cellSize={cellSize}
        width={width}
        height={height}
        onLayout={handleLayout}
      />
    </View>
  );
}
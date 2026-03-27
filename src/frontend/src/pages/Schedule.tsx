import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useActor } from "../hooks/useActor";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const PERIODS = [1, 2, 3, 4, 5, 6];

export default function Schedule() {
  const { actor } = useActor();
  const todayIdx = (() => {
    const d = new Date().getDay();
    return d === 0 || d === 6 ? 0 : d - 1; // Mon=0
  })();
  const [selectedDay, setSelectedDay] = useState(todayIdx);

  const { data: schedule, isLoading } = useQuery({
    queryKey: ["schedule"],
    queryFn: () => actor!.getSchedule(),
    enabled: !!actor,
  });

  const { data: classes } = useQuery({
    queryKey: ["classes"],
    queryFn: () => actor!.getClasses(),
    enabled: !!actor,
  });

  const getEntry = (day: number, period: number) =>
    schedule?.find(
      (e) => Number(e.dayOfWeek) === day && Number(e.periodNumber) === period,
    );

  const getClassName = (classId: string) =>
    classes?.find((c) => c.id === classId)?.name ?? "";

  const PERIOD_COLORS = [
    "bg-blue-50 border-l-2 border-primary text-primary",
    "bg-purple-50 border-l-2 border-accent text-accent",
    "bg-green-50 border-l-2 border-success text-success",
    "bg-yellow-50 border-l-2 border-yellow-500 text-yellow-700",
    "bg-orange-50 border-l-2 border-orange-400 text-orange-700",
    "bg-pink-50 border-l-2 border-pink-400 text-pink-700",
  ];

  return (
    <div className="space-y-4">
      {/* Day selector (mobile) */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {DAYS.map((day, idx) => (
          <button
            type="button"
            key={day}
            onClick={() => setSelectedDay(idx)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedDay === idx
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            {day}
            {idx === todayIdx && (
              <span
                className={`ml-1 text-xs ${selectedDay === idx ? "opacity-70" : "text-primary"}`}
              >
                •
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {PERIODS.map((p) => (
            <Skeleton key={p} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Mobile: selected day list */}
          <div className="md:hidden space-y-3">
            {PERIODS.map((period) => {
              const entry = getEntry(selectedDay, period);
              return (
                <div
                  key={period}
                  className={`rounded-xl p-4 ${
                    entry
                      ? PERIOD_COLORS[(period - 1) % PERIOD_COLORS.length]
                      : "bg-card border border-border"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground mb-1">
                        Period {period}
                      </div>
                      {entry ? (
                        <>
                          <div className="font-semibold text-foreground">
                            {entry.subject}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {getClassName(entry.classId)} · Room{" "}
                            {entry.roomNumber}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          Free period
                        </div>
                      )}
                    </div>
                    {entry && (
                      <div className="text-xs text-muted-foreground text-right">
                        <div>{entry.startTime}</div>
                        <div>{entry.endTime}</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: full grid */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-xs font-semibold text-muted-foreground p-2 w-16">
                    Period
                  </th>
                  {DAYS.map((day, idx) => (
                    <th
                      key={day}
                      className={`text-center text-xs font-semibold p-2 ${
                        idx === todayIdx
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {day}
                      {idx === todayIdx && (
                        <span className="ml-1 text-primary">•</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((period) => (
                  <tr key={period} className="border-t border-border">
                    <td className="p-2 text-xs font-semibold text-muted-foreground">
                      P{period}
                    </td>
                    {DAYS.map((dayName, dayIdx) => {
                      const entry = getEntry(dayIdx, period);
                      return (
                        <td key={dayName} className="p-1.5">
                          {entry ? (
                            <div
                              className={`rounded-lg p-2.5 text-xs ${PERIOD_COLORS[(period - 1) % PERIOD_COLORS.length]}`}
                            >
                              <div className="font-semibold text-foreground">
                                {entry.subject}
                              </div>
                              <div className="text-muted-foreground mt-0.5">
                                {getClassName(entry.classId)}
                              </div>
                              <div className="text-muted-foreground">
                                {entry.startTime}–{entry.endTime}
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-lg p-2.5 bg-muted/30 text-xs text-muted-foreground text-center">
                              —
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

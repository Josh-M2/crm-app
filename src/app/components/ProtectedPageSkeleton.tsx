"use client";

type TableSkeletonProps = {
  rows?: number;
  columns?: number;
  className?: string;
};

const SkeletonBlock = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
);

export function PageHeaderSkeleton({
  hasAction = false,
}: {
  hasAction?: boolean;
}) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <SkeletonBlock className="mb-3 h-9 w-64" />
        <SkeletonBlock className="h-5 w-96 max-w-full" />
      </div>
      {hasAction && <SkeletonBlock className="h-10 w-32" />}
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  className = "",
}: TableSkeletonProps) {
  return (
    <div
      className={`overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
    >
      <div
        className="grid gap-4 border-b border-gray-100 bg-gray-50 p-4"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <SkeletonBlock key={index} className="h-4 w-24" />
        ))}
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-4 p-4"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: columns }).map((_, columnIndex) => (
              <SkeletonBlock
                key={columnIndex}
                className={columnIndex === columns - 1 ? "h-8 w-24" : "h-5 w-32"}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div>
      <div className="mb-8 place-items-center">
        <SkeletonBlock className="mb-3 h-9 w-72" />
        <SkeletonBlock className="h-5 w-96 max-w-full" />
      </div>
      <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl bg-white p-6 shadow">
            <SkeletonBlock className="mx-auto mb-3 h-7 w-20" />
            <SkeletonBlock className="mx-auto h-4 w-28" />
          </div>
        ))}
      </div>
      <div className="rounded-lg bg-white p-6 shadow">
        <SkeletonBlock className="mb-6 h-7 w-48" />
        <div className="space-y-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index}>
              <SkeletonBlock className="mb-2 h-5 w-2/3" />
              <SkeletonBlock className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div>
      <PageHeaderSkeleton />
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="mb-8">
          <SkeletonBlock className="mb-4 h-7 w-52" />
          <div className="h-[300px] rounded-lg border border-gray-200 bg-white p-6">
            <SkeletonBlock className="h-full w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeaderSkeleton />
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
        <div className="space-y-5">
          <SkeletonBlock className="h-14 w-full" />
          <SkeletonBlock className="h-40 w-full" />
          <SkeletonBlock className="h-14 w-full" />
          <div className="flex justify-end">
            <SkeletonBlock className="h-10 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div>
      <div className="mb-8 place-items-center">
        <SkeletonBlock className="h-9 w-72" />
      </div>
      <div className="space-y-6">
        <div>
          <SkeletonBlock className="mb-3 h-5 w-48" />
          <SkeletonBlock className="h-12 w-full max-w-xl" />
        </div>
        <SkeletonBlock className="h-px w-full" />
        <div className="flex justify-end gap-2">
          <SkeletonBlock className="h-10 w-52" />
          <SkeletonBlock className="h-10 w-48" />
        </div>
      </div>
    </div>
  );
}

export function ListPanelSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full rounded-md bg-white shadow-md">
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="flex flex-wrap items-center justify-between gap-4 p-4 sm:flex-nowrap"
          >
            <div className="min-w-0 flex-1">
              <SkeletonBlock className="mb-2 h-5 w-40" />
              <SkeletonBlock className="h-4 w-56" />
            </div>
            <SkeletonBlock className="h-8 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}



export const QuestionRowShimmer = () => {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start gap-3 animate-pulse">
        {/* Icon */}
        <div className="h-8 w-8 rounded bg-gray-200" />

        <div className="flex-1 space-y-3">
          {/* Question text */}
          <div className="h-4 w-3/4 rounded bg-gray-200" />
          <div className="h-4 w-1/2 rounded bg-gray-200" />

          {/* Badges */}
          <div className="flex gap-2">
            <div className="h-5 w-16 rounded bg-gray-200" />
            <div className="h-5 w-20 rounded bg-gray-200" />
            <div className="h-5 w-14 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
};

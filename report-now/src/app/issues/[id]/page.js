// File: /src/app/issues/[id]/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import TimelineSection from "@/components/TimelineSection";
// import EditStatusForm from "@/components/EditStatusForm";
import LeaveReviewForm from "@/components/LeaveReviewForm";
import ReviewCard from "@/components/ReviewCard";
import { FaStar, FaStarHalfAlt, FaRegStar, FaArrowUp } from "react-icons/fa";

function normalizeIdList(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }

  const numericValues = raw
    .map((value) => {
      if (typeof value === "number") {
        return value;
      }
      if (typeof value === "string") {
        const parsed = Number.parseInt(value, 10);
        return Number.isNaN(parsed) ? null : parsed;
      }
      return null;
    })
    .filter((value) => typeof value === "number" && Number.isInteger(value));

  return Array.from(new Set(numericValues));
}

function normalizeUserId(raw) {
  if (typeof raw === "number" && Number.isInteger(raw)) {
    return raw;
  }

  if (typeof raw === "string") {
    const parsed = Number.parseInt(raw, 10);
    return Number.isInteger(parsed) ? parsed : null;
  }

  return null;
}

export default function IssueDetailPage() {
  const params = useParams();
  const { data: session, status: sessionStatus } = useSession();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [editingStatus, setEditingStatus] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [upvoteIds, setUpvoteIds] = useState([]);
  const [isVoting, setIsVoting] = useState(false);

  // Fetch issue details from API
  useEffect(() => {
    if (!params.id) return;
    const fetchIssue = async () => {
      try {
        const res = await fetch(`/api/issues/${params.id}`);
        if (!res.ok) throw new Error("Issue not found.");
        const data = await res.json();
        console.log("Fetched issue data:", data);
        setIssue(data);
        setUpvoteIds(normalizeIdList(data.upvotes));
      } catch (err) {
        console.error("Error fetching issue:", err);
        setFetchError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchIssue();
  }, [params.id]);

  // Handler for updating issue after status change
  const handleStatusUpdate = useCallback(
    (updatedIssue) => {
      setIssue(updatedIssue);
      setUpvoteIds(normalizeIdList(updatedIssue.upvotes));
      setEditingStatus(false);
    },
    []
  );

  // Handler for timeline update
  const handleTimelineUpdate = useCallback(
    (updatedIssue) => {
      setIssue(updatedIssue);
      setUpvoteIds(normalizeIdList(updatedIssue.upvotes));
    },
    []
  );

  // Handler for review submission (refresh issue data)
  const handleReviewSubmit = useCallback(() => {
    // Re-fetch issue details after review submission
    const refreshIssue = async () => {
      try {
        const res = await fetch(`/api/issues/${params.id}`);
        if (!res.ok) throw new Error("Issue not found.");
        const data = await res.json();
        console.log("Refreshed issue data:", data);
        setIssue(data);
        setUpvoteIds(normalizeIdList(data.upvotes));
      } catch (err) {
        console.error("Error refreshing issue:", err);
      }
    };
    refreshIssue();
  }, [params.id]);

  // Function to navigate between media items
  const navigateMedia = (index) => {
    setActiveMediaIndex(index);
  };

  const renderStarRating = (rating) => {
    if (!rating) return null;

    const stars = [];
    const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5

    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i - 0.5 === roundedRating) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }

    return (
      <div className="flex items-center">
        <div className="flex mr-2">{stars}</div>
        <span className="text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  if (loading || sessionStatus === "loading") {
    return <p className="p-4">Loading issue details...</p>;
  }
  if (fetchError || !issue) {
    return (
      <p className="p-4 text-red-500">
        Error: {fetchError || "Issue not found."}
      </p>
    );
  }

  const userIdRaw = session?.user?.id ?? null;
  const userId = normalizeUserId(userIdRaw);
  const isVotingAllowed =
    issue.status !== "Done" && issue.status !== "Rejected";
  const hasUpvoted = userId != null && upvoteIds.includes(userId);
  const canVote = isVotingAllowed && userId != null;
  const voteCount = upvoteIds.length;

  const handleVote = async () => {
    if (!canVote || isVoting) {
      return;
    }

    setIsVoting(true);
    try {
      const response = await fetch(`/api/issues/${issue.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vote: "up" }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error("Voting error:", error);
        return;
      }

      const updatedIssue = await response.json();
      setIssue(updatedIssue);
      setUpvoteIds(normalizeIdList(updatedIssue.upvotes));
    } catch (error) {
      console.error("Error submitting vote:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const voteButtonClasses = `p-2 rounded-full border transition disabled:opacity-50 disabled:cursor-not-allowed ${
    hasUpvoted
      ? "bg-red-500 border-red-600 text-white hover:bg-red-600"
      : "border-gray-300 text-gray-600 hover:bg-gray-100"
  }`;

  // Check if current citizen user has already left a review
  const userHasReviewed =
    session &&
    session.user &&
    issue.reviews &&
    issue.reviews.some((review) => review.userId === session.user.id);

  return (
    <div className="max-w-2xl mx-auto p-10 space-y-6 bg-white rounded-sm">
      {/* Media Section - Images Only */}
      {issue.mediaUrls && issue.mediaUrls.length > 0 && (
        <div className="space-y-2">
          <div className="relative h-84 w-full rounded overflow-hidden bg-gray-100">
            <Image
              src={issue.mediaUrls[activeMediaIndex]}
              alt={issue.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Media Thumbnails - only show if more than one image */}
          {issue.mediaUrls.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto py-2">
              {issue.mediaUrls.map((url, idx) => (
                <div
                  key={idx}
                  onClick={() => navigateMedia(idx)}
                  className={`relative h-16 w-16 flex-shrink-0 cursor-pointer rounded overflow-hidden border-2 ${
                    idx === activeMediaIndex
                      ? "border-blue-500"
                      : "border-transparent"
                  }`}
                >
                  <Image
                    src={url}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{issue.title}</h1>
        <div className="flex items-center space-x-2">
          <span className="text-lg font-semibold text-gray-700">
            {voteCount}
          </span>
          <button
            type="button"
            onClick={handleVote}
            disabled={!canVote || isVoting}
            className={voteButtonClasses}
            aria-label="Toggle upvote for issue"
          >
            <FaArrowUp />
          </button>
        </div>
      </div>

      <p className="text-gray-600">{issue.description}</p>

      {/* Rest of your component remains the same */}
      <div className="flex items-center space-x-2">
        <span className="font-semibold">Location:</span>
        <p>{issue.location || "Unknown"}</p>
      </div>

      <div className="flex items-center space-x-2">
        <span className="font-semibold">Status:</span>
        <p>{issue.status}</p>
        {session &&
          session.user &&
          session.user.role === "governmentDepartment" &&
          !editingStatus && (
            <button
              onClick={() => setEditingStatus(true)}
              className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition"
            >
              Edit
            </button>
          )}
        {editingStatus && (
          <EditStatusForm
            issueId={params.id}
            currentStatus={issue.status}
            onUpdate={handleStatusUpdate}
            onCancel={() => setEditingStatus(false)}
          />
        )}
      </div>

      <div className="flex items-center space-x-2">
        <span className="font-semibold">Reported At:</span>
        <p>{new Date(issue.createdAt).toLocaleString()}</p>
      </div>

      {issue.latestUpdate && (
        <div className="flex items-center space-x-2">
          <span className="font-semibold">Latest Update:</span>
          <p>{issue.latestUpdate}</p>
        </div>
      )}

      {/* Timeline Update Section */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-2">Timeline Updates</h2>
        {issue.timeline && issue.timeline.length > 0 ? (
          <ul className="space-y-2">
            {issue.timeline.map((update, idx) => (
              <li key={idx} className="border p-2 rounded">
                <p className="text-sm">{update.text}</p>
                <p className="text-xs text-gray-500">
                  {new Date(update.timestamp).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 text-sm">No timeline updates yet.</p>
        )}
        {session &&
          session.user &&
          session.user.role === "governmentDepartment" && (
            <TimelineSection
              issueId={params.id}
              currentTimeline={issue.timeline}
              onTimelineUpdate={handleTimelineUpdate}
            />
          )}
      </div>

      {/* Leave Review Section for citizen users */}
      {session &&
        session.user &&
        session.user.role === "citizen" &&
        !userHasReviewed && (
          <div className="mt-6">
            <LeaveReviewForm
              issueId={params.id}
              onReviewSubmit={handleReviewSubmit}
            />
          </div>
        )}

      {/* Reviews Section */}
      {issue.reviews && issue.reviews.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Reviews</h2>
            {issue.averageRating !== null && (
              <div className="flex items-center">
                <span className="font-semibold mr-2">Average Rating:</span>
                {renderStarRating(issue.averageRating)}
                <span className="text-sm ml-2 text-gray-500">
                  (from {issue.reviews.length}{" "}
                  {issue.reviews.length === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}
          </div>
          <ul className="space-y-2">
            {issue.reviews.map((review) => (
              <li key={review.id}>
                <ReviewCard review={review} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

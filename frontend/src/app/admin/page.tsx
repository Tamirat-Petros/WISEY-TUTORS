"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronLeft, ChevronRight, ClipboardList, LogOut, RefreshCw, Sparkles } from "lucide-react";
import { ApiError, apiRequest, apiRequestResult, type BookingRequest, type BookingRequestStatus, type Inquiry, type InquiryStatus, type PaginationMeta } from "@/lib/api";
import { useAdminAuth } from "@/components/admin-auth-provider";

type InboxTab = "bookings" | "inquiries";
type RecordItem = BookingRequest | Inquiry;
const initialPagination: PaginationMeta = { page: 1, pageSize: 25, total: 0, totalPages: 0 };
const bookingStatuses: BookingRequestStatus[] = ["NEW", "CONTACTED", "OFFERED", "ACCEPTED", "DECLINED", "CLOSED"];
const inquiryStatuses: InquiryStatus[] = ["NEW", "CONTACTED", "CONVERTED", "CLOSED"];

function displayStatus(status: string) {
  return status.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function displayDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "W";
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { accessToken, user, isReady, refresh, logout } = useAdminAuth();
  const [tab, setTab] = useState<InboxTab>("bookings");
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(initialPagination);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (isReady && !user) router.replace("/admin/login");
  }, [isReady, user, router]);

  const requestWithSession = useCallback(async <T,>(action: (token: string) => Promise<T>): Promise<T> => {
    let token = accessToken;
    if (!token) {
      const session = await refresh();
      if (!session) throw new ApiError("Your session has expired. Please sign in again.", 401, "UNAUTHORIZED");
      token = session.accessToken;
    }
    try {
      return await action(token);
    } catch (cause) {
      if (!(cause instanceof ApiError) || cause.status !== 401) throw cause;
      const session = await refresh();
      if (!session) throw cause;
      return action(session.accessToken);
    }
  }, [accessToken, refresh]);

  const loadRecords = useCallback(async (requestedPage = page) => {
    if (!user) return;
    setLoading(true);
    setError("");
    const endpoint = tab === "bookings" ? "/admin/booking-requests" : "/admin/inquiries";
    try {
      const result = await requestWithSession((token) => apiRequestResult<RecordItem[]>(endpoint + "?page=" + requestedPage + "&pageSize=25", { token }));
      setRecords(result.data);
      setPagination(result.pagination ?? { ...initialPagination, page: requestedPage, total: result.data.length, totalPages: result.data.length ? requestedPage : 0 });
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) {
        setError("Your session has ended. Sign in again to continue.");
        router.replace("/admin/login");
      } else {
        setError(cause instanceof ApiError ? cause.message : "We couldn't load the inbox. Please try again.");
      }
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [page, tab, user, requestWithSession, router]);

  useEffect(() => {
    if (!isReady || !user) return;
    const timer = window.setTimeout(() => { void loadRecords(page); }, 0);
    return () => window.clearTimeout(timer);
  }, [isReady, user, page, tab, loadRecords]);

  const counts = useMemo(() => ({
    newItems: records.filter((record) => record.status === "NEW").length,
    inProgress: records.filter((record) => ["CONTACTED", "OFFERED"].includes(record.status)).length,
    resolved: records.filter((record) => ["ACCEPTED", "CONVERTED", "CLOSED", "DECLINED"].includes(record.status)).length,
  }), [records]);

  async function changeStatus(record: RecordItem, status: string) {
    const endpoint = tab === "bookings" ? "/admin/booking-requests/" + record.id + "/status" : "/admin/inquiries/" + record.id + "/status";
    setUpdatingId(record.id);
    setError("");
    try {
      await requestWithSession((token) => apiRequest(endpoint, { method: "PATCH", body: { status }, token }));
      setRecords((current) => current.map((item) => item.id === record.id ? { ...item, status } as RecordItem : item));
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "We couldn't update this request. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function signOut() {
    try { await logout(); } catch {}
    router.replace("/admin/login");
  }

  if (!isReady || !user) return <div className="admin-loading" role="status">Opening your workspace…</div>;

  const canManage = ["OWNER", "ADMIN"].includes(user.role);
  const heading = tab === "bookings" ? "Session requests" : "Enquiries";
  const statuses = tab === "bookings" ? bookingStatuses : inquiryStatuses;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link className="brand" href="/"><span className="brand-mark">w</span><span className="brand-name">Wisey<small>TUTORS</small></span></Link>
        <span className="admin-nav-label">Workspace</span>
        <nav className="admin-nav" aria-label="Workspace navigation">
          <a className={tab === "bookings" ? "active" : ""} href="#requests" onClick={(event) => { event.preventDefault(); setTab("bookings"); setPage(1); }}><CalendarDays />Session requests</a>
          <a className={tab === "inquiries" ? "active" : ""} href="#enquiries" onClick={(event) => { event.preventDefault(); setTab("inquiries"); setPage(1); }}><ClipboardList />Enquiries</a>
        </nav>
        <div className="sidebar-bottom"><div className="admin-nav"><button type="button" onClick={() => void signOut()}><LogOut />Sign out</button></div></div>
      </aside>

      <main className="admin-main" id="requests">
        <header className="admin-topbar">
          <div><span className="eyebrow"><span className="eyebrow-dot" /> Wisey team space</span><h1>Your learner inbox</h1><p>A calm place to keep every conversation moving.</p></div>
          <div className="admin-user"><span className="admin-avatar" aria-hidden="true">{initials(user.displayName)}</span><div><strong>{user.displayName}</strong><small>{displayStatus(user.role)}</small></div></div>
        </header>

        <section className="admin-toolbar" aria-label="Inbox controls">
          <div className="admin-tabs" role="tablist" aria-label="Inbox type">
            <button type="button" role="tab" aria-selected={tab === "bookings"} className={tab === "bookings" ? "selected" : ""} onClick={() => { setTab("bookings"); setPage(1); }}>Session requests</button>
            <button type="button" role="tab" aria-selected={tab === "inquiries"} className={tab === "inquiries" ? "selected" : ""} onClick={() => { setTab("inquiries"); setPage(1); }}>Enquiries</button>
          </div>
          <button className="admin-refresh" type="button" onClick={() => void loadRecords(page)} disabled={loading}><RefreshCw className={loading ? "spin" : ""} />Refresh inbox</button>
        </section>

        <section className="metric-grid" aria-label="Inbox summary">
          <article className="metric-card"><span>New on this page</span><strong>{loading ? "—" : counts.newItems}</strong></article>
          <article className="metric-card"><span>Needs a follow-up</span><strong>{loading ? "—" : counts.inProgress}</strong></article>
          <article className="metric-card"><span>All requests</span><strong>{loading ? "—" : pagination.total}</strong></article>
        </section>

        <section className="inbox-card" aria-labelledby="inbox-title">
          <div className="inbox-heading"><div><h2 id="inbox-title">{heading}</h2><span>{pagination.total} {pagination.total === 1 ? "request" : "requests"} · newest first</span></div></div>
          {error && <div className="inbox-error" role="alert">{error}</div>}
          {loading ? <div className="inbox-empty" role="status">Loading the latest requests…</div> : records.length === 0 ? <div className="inbox-empty"><Sparkles size={20} /><p>It’s quiet for now. New {tab === "bookings" ? "session requests" : "enquiries"} will show up here.</p></div> : (
            <div className="inbox-table-wrap">
              <table className="inbox-table">
                <thead><tr><th>Contact</th><th>Learner & subject</th><th>Received</th><th>Status</th><th>Update</th></tr></thead>
                <tbody>{records.map((record) => {
                  const booking = "mode" in record ? record : null;
                  return <tr key={record.id}>
                    <td><strong>{record.contactName}</strong><small><a href={"mailto:" + record.email}>{record.email}</a>{record.phone ? " · " + record.phone : ""}</small></td>
                    <td><strong>{record.subjectInterest}</strong><small>{record.learnerAgeGroup.replaceAll("_", " ")}{booking ? " · " + displayStatus(booking.mode) + " · " + booking.timezone : ""}</small>{record.message && <small>{record.message}</small>}</td>
                    <td>{displayDate(record.createdAt)}</td>
                    <td><span className={"status-pill " + record.status.toLowerCase()}>{displayStatus(record.status)}</span></td>
                    <td><select className="status-select" aria-label={"Update " + record.contactName + " status"} value={record.status} disabled={!canManage || updatingId === record.id} onChange={(event) => void changeStatus(record, event.target.value)}>
                      {statuses.map((status) => <option key={status} value={status}>{displayStatus(status)}</option>)}
                    </select></td>
                  </tr>;
                })}</tbody>
              </table>
            </div>
          )}
          {!canManage && <p className="form-status" style={{ padding: "0 17px 12px" }}>Your staff role can review the inbox. An administrator can update request statuses.</p>}
          <div className="inbox-pagination"><span>Page {pagination.page} of {Math.max(1, pagination.totalPages)}</span><div><button className="admin-refresh" type="button" aria-label="Previous page" disabled={page <= 1 || loading} onClick={() => setPage((value) => Math.max(1, value - 1))}><ChevronLeft /></button><button className="admin-refresh" type="button" aria-label="Next page" disabled={loading || page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)}><ChevronRight /></button></div></div>
        </section>
        <footer className="admin-footer"><span>Wisey Tutors · Private workspace</span><span>{counts.resolved} resolved on this page</span></footer>
      </main>
    </div>
  );
}



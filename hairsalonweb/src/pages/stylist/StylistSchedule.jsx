import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import { authApis, endpoints } from "../../configs/api/Apis";
import "../../styles/admin/AdminCommon.css";
import "./StylistSchedule.css";

const WEEK_DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function normalizeArray(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.content)) return data.data.content;
    if (Array.isArray(data?.result)) return data.result;
    if (Array.isArray(data?.result?.content)) return data.result.content;
    return [];
}

function getVietnamToday() {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Ho_Chi_Minh",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());

    const year = parts.find((part) => part.type === "year")?.value;
    const month = parts.find((part) => part.type === "month")?.value;
    const day = parts.find((part) => part.type === "day")?.value;

    return `${year}-${month}-${day}`;
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatTime(value) {
    if (!value) return "--:--";

    const text = String(value);

    return text.length >= 5 ? text.substring(0, 5) : text;
}

function getScheduleDate(schedule) {
    return (
        schedule.scheduleDate ||
        schedule.workDate ||
        schedule.date ||
        schedule.slotDate ||
        ""
    );
}

function getStartTime(schedule) {
    return (
        schedule.startTime ||
        schedule.startAt ||
        schedule.fromTime ||
        ""
    );
}

function getEndTime(schedule) {
    return (
        schedule.endTime ||
        schedule.endAt ||
        schedule.toTime ||
        ""
    );
}

function getScheduleStatus(schedule) {
    return String(
        schedule.status ||
        schedule.scheduleStatus ||
        ""
    ).toUpperCase();
}

function isWorkingSchedule(schedule) {
    const status = getScheduleStatus(schedule);

    if (schedule.isWorking === false || schedule.working === false) {
        return false;
    }

    if (["OFF", "DAY_OFF", "LEAVE", "ABSENT", "CANCELLED"].includes(status)) {
        return false;
    }

    return true;
}

function getMonthDays(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let firstWeekDay = firstDay.getDay();

    if (firstWeekDay === 0) {
        firstWeekDay = 7;
    }

    const days = [];

    for (let index = 1; index < firstWeekDay; index += 1) {
        days.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
        days.push(new Date(year, month, day));
    }

    while (days.length % 7 !== 0) {
        days.push(null);
    }

    return days;
}

function getMonthTitle(year, month) {
    return new Intl.DateTimeFormat("vi-VN", {
        month: "long",
        year: "numeric",
    }).format(new Date(year, month, 1));
}

function StylistSchedule() {
    const today = useMemo(() => getVietnamToday(), []);

    const todayDate = useMemo(() => {
        const [year, month, day] = today.split("-").map(Number);
        return new Date(year, month - 1, day);
    }, [today]);

    const [currentMonth, setCurrentMonth] = useState(todayDate.getMonth());
    const [currentYear, setCurrentYear] = useState(todayDate.getFullYear());

    const [schedules, setSchedules] = useState([]);
    const [selectedDate, setSelectedDate] = useState(today);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadSchedules = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await authApis().get(endpoints.stylistMySchedule);

            setSchedules(normalizeArray(response.data));
        } catch (err) {
            console.error("LOAD STYLIST SCHEDULE ERROR:", err);

            setSchedules([]);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Không thể tải lịch làm việc."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSchedules();
    }, [loadSchedules]);

    const workingSchedules = useMemo(() => {
        return schedules.filter(isWorkingSchedule);
    }, [schedules]);

    const scheduleMap = useMemo(() => {
        const map = {};

        workingSchedules.forEach((schedule) => {
            const date = getScheduleDate(schedule);

            if (!date) return;

            if (!map[date]) {
                map[date] = [];
            }

            map[date].push(schedule);
        });

        Object.keys(map).forEach((date) => {
            map[date].sort((first, second) =>
                String(getStartTime(first)).localeCompare(
                    String(getStartTime(second))
                )
            );
        });

        return map;
    }, [workingSchedules]);

    const monthDays = useMemo(() => {
        return getMonthDays(currentYear, currentMonth);
    }, [currentYear, currentMonth]);

    const selectedSchedules = scheduleMap[selectedDate] || [];

    const goToPreviousMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear((year) => year - 1);
            return;
        }

        setCurrentMonth((month) => month - 1);
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear((year) => year + 1);
            return;
        }

        setCurrentMonth((month) => month + 1);
    };

    const goToToday = () => {
        setCurrentMonth(todayDate.getMonth());
        setCurrentYear(todayDate.getFullYear());
        setSelectedDate(today);
    };

    const handleSelectDate = (date) => {
        if (!date) return;

        const dateString = formatDate(date);

        setSelectedDate(dateString);
    };

    return (
        <div className="admin-page stylist-schedule-page">
            <Header role="STYLIST" title="Lịch của tôi" />

            <main className="admin-main stylist-schedule-main">
                <div className="admin-shell">

                    <section className="admin-heading stylist-schedule-heading">
                        <div>
                            <span className="admin-section-eyebrow">MY SCHEDULE</span>
                            <h1>Lịch của tôi</h1>
                            <p>Xem lịch làm việc theo từng ngày trong tháng.</p>
                        </div>
                    </section>

                    {error && (
                        <div className="stylist-schedule-error" role="alert">
                            <span>{error}</span>
                            <button type="button" onClick={loadSchedules}>Thử lại</button>
                        </div>
                    )}

                    <section className="stylist-schedule-card">

                        <div className="stylist-schedule-calendar-header">
                            <button type="button" className="stylist-schedule-nav-button" onClick={goToPreviousMonth}>←</button>

                            <div className="stylist-schedule-month-title">
                                <h2>{getMonthTitle(currentYear, currentMonth)}</h2>
                                <button type="button" className="stylist-schedule-today-button" onClick={goToToday}>Hôm nay</button>
                            </div>

                            <button type="button" className="stylist-schedule-nav-button" onClick={goToNextMonth}>→</button>
                        </div>

                        <div className="stylist-schedule-calendar">

                            <div className="stylist-schedule-weekdays">
                                {WEEK_DAYS.map((day) => (
                                    <div key={day} className="stylist-schedule-weekday">{day}</div>
                                ))}
                            </div>

                            <div className="stylist-schedule-days">
                                {monthDays.map((date, index) => {
                                    if (!date) {
                                        return <div key={`empty-${index}`} className="stylist-schedule-day stylist-schedule-day-empty"></div>;
                                    }

                                    const dateString = formatDate(date);
                                    const daySchedules = scheduleMap[dateString] || [];
                                    const isWorking = daySchedules.length > 0;
                                    const isToday = dateString === today;
                                    const isSelected = dateString === selectedDate;

                                    return (
                                        <button key={dateString} type="button" className={`stylist-schedule-day ${isWorking ? "working" : ""} ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}`} onClick={() => handleSelectDate(date)}>
                                            <span className="stylist-schedule-day-number">{date.getDate()}</span>

                                            {isWorking && (
                                                <span className="stylist-schedule-day-work">
                                                    {daySchedules.length === 1 ? formatTime(getStartTime(daySchedules[0])) : `${daySchedules.length} ca`}
                                                </span>
                                            )}

                                            {isWorking && <span className="stylist-schedule-day-dot"></span>}
                                        </button>
                                    );
                                })}
                            </div>

                        </div>

                        <div className="stylist-schedule-legend">
                            <span><i className="stylist-schedule-legend-dot"></i> Có lịch làm</span>
                            <span><i className="stylist-schedule-legend-today"></i> Hôm nay</span>
                        </div>
                    </section>

                    <section className="stylist-schedule-detail-card">

                        <div className="stylist-schedule-detail-header">
                            <div>
                                <span className="admin-section-eyebrow">DAILY SCHEDULE</span>
                                <h2>
                                    Lịch làm việc ngày{" "}
                                    {new Date(`${selectedDate}T00:00:00`).toLocaleDateString("vi-VN", {
                                        weekday: "long",
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                    })}
                                </h2>
                            </div>

                            {selectedDate === today && <span className="stylist-schedule-today-badge">HÔM NAY</span>}
                        </div>

                        {loading ? (
                            <div className="stylist-schedule-empty">Đang tải lịch làm việc...</div>
                        ) : selectedSchedules.length === 0 ? (
                            <div className="stylist-schedule-empty">
                                <strong>Không có lịch làm việc</strong>
                                <span>Ngày này Stylist không có ca làm.</span>
                            </div>
                        ) : (
                            <div className="stylist-schedule-shifts">
                                {selectedSchedules.map((schedule) => (
                                    <div key={schedule.id || `${selectedDate}-${getStartTime(schedule)}`} className="stylist-schedule-shift">
                                        <div className="stylist-schedule-shift-icon">◷</div>

                                        <div className="stylist-schedule-shift-info">
                                            <span>CA LÀM</span>
                                            <strong>{formatTime(getStartTime(schedule))} - {formatTime(getEndTime(schedule))}</strong>
                                        </div>

                                        <div className="stylist-schedule-shift-status">ĐI LÀM</div>
                                    </div>
                                ))}
                            </div>
                        )}

                    </section>

                </div>
            </main>
        </div>
    );
}

export default StylistSchedule;
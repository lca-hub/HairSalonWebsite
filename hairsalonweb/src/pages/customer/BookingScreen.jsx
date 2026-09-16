import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApis, endpoints } from "../../configs/api/Apis";
import "./Booking.css";

function BookingScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const queryStylistId = searchParams.get("stylistId");
  const queryServiceId = searchParams.get("serviceId");

  const [stylists, setStylists] = useState([]);
  const [selectedStylist, setSelectedStylist] = useState(queryStylistId || "");

  const [stylist, setStylist] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(queryServiceId || "");

  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");

  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [slotLoading, setSlotLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {
    if (queryStylistId) {
      navigate(`/stylists/${queryStylistId}`);
      return;
    }

    if (queryServiceId) {
      navigate("/services");
      return;
    }

    navigate("/customer/appointments");
  };

  // =====================================================
  // LOAD STYLIST + SERVICES
  // =====================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const stylistListResponse = await authApis().get(endpoints.stylists, {
          params: {
            page: 0,
            size: 50,
            isActive: true,
          },
        });

        if (!stylistListResponse.ok) {
          throw new Error("Không thể tải danh sách stylist");
        }

        const stylistListData = await stylistListResponse.json();

        const stylistList = stylistListData.content || [];

        setStylists(stylistList);

        // =========================================
        // CÓ STYLIST ID
        // =========================================

        if (queryStylistId) {
          const currentStylist = stylistList.find(
            (item) => String(item.id) === String(queryStylistId),
          );

          if (!currentStylist) {
            throw new Error("Không tìm thấy stylist");
          }

          setSelectedStylist(String(currentStylist.id));
          setStylist(currentStylist);

          const serviceResponse = await authApis().get(
            endpoints.stylistServices(queryStylistId),
            {
              params: {
                page: 0,
                size: 50,
              },
            },
          );

          if (!serviceResponse.ok) {
            throw new Error("Không thể tải dịch vụ của stylist");
          }

          const serviceData = await serviceResponse.json();
          const serviceList = serviceData.content || [];

          setServices(serviceList);

          // Nếu URL có serviceId thì chọn sẵn
          if (queryServiceId) {
            const currentService = serviceList.find(
              (service) =>
                String(service.id) === String(queryServiceId),
            );

            if (currentService) {
              setSelectedService(String(currentService.id));
            } else {
              setSelectedService("");
            }
          } else {
            setSelectedService("");
          }

          return;
        }

        // =========================================
        // CHỈ CÓ SERVICE ID
        // =========================================

        if (queryServiceId) {
          const serviceResponse = await authApis().get(
            endpoints.serviceDetail(queryServiceId),
          );

          if (!serviceResponse.ok) {
            throw new Error("Không tìm thấy dịch vụ");
          }

          const serviceData = await serviceResponse.json();
          setStylist(null);
          setServices([serviceData]);
          setSelectedService(String(serviceData.id));

          return;
        }

        // =========================================
        // VÀO TRỰC TIẾP
        // =========================================

        setStylist(null);
        setServices([]);
        setSelectedService("");
      } catch (err) {
        console.error("LOAD BOOKING DATA ERROR:", err);

        setError(
          err.message || "Không thể tải dữ liệu đặt lịch.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [queryStylistId, queryServiceId]);

  // =====================================================
  // KHI CHỌN STYLIST
  // =====================================================

  useEffect(() => {
    const loadStylistData = async () => {
      if (!selectedStylist) {
        setStylist(null);

        if (!queryServiceId) {
          setServices([]);
          setSelectedService("");
        }

        setSlots([]);
        setSelectedSlot("");

        return;
      }

      // Nếu stylist đã được load từ query
      if (
        queryStylistId &&
        String(selectedStylist) === String(queryStylistId)
      ) {
        return;
      }

      try {
        setError("");

        const [stylistResponse, serviceResponse] = await Promise.all([
          authApis().get(endpoints.stylistDetail(selectedStylist)),
          authApis().get(endpoints.stylistServices(selectedStylist), {
            params: {
              page: 0,
              size: 50,
            },
          }),
        ]);
        if (!stylistResponse.data || !serviceResponse.data) {
          throw new Error("Không thể tải thông tin stylist");
        }

        const stylistData = await stylistResponse.json();
        const serviceData = await serviceResponse.json();

        const serviceList = serviceData.content || [];

        setStylist(stylistData);
        setServices(serviceList);

        // Nếu có serviceId trên URL thì giữ lại nếu stylist cung cấp service đó
        if (queryServiceId) {
          const currentService = serviceList.find(
            (service) =>
              String(service.id) === String(queryServiceId),
          );

          if (currentService) {
            setSelectedService(String(currentService.id));
          } else {
            setSelectedService("");
          }
        } else {
          setSelectedService("");
        }

        setDate("");
        setSlots([]);
        setSelectedSlot("");
      } catch (err) {
        console.error("LOAD STYLIST ERROR:", err);

        setError(
          err.message || "Không thể tải stylist.",
        );
      }
    };

    loadStylistData();
  }, [selectedStylist, queryStylistId, queryServiceId]);

  // =====================================================
  // LOAD AVAILABLE SLOTS
  // =====================================================

  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedStylist || !selectedService || !date) {
        setSlots([]);
        setSelectedSlot("");

        return;
      }

      try {
        setSlotLoading(true);
        setError("");

        const response = await authApis().get(
          endpoints.availableSlots(selectedStylist),
          {
            params: {
              workDate: date,
              serviceId: selectedService,
            },
          },
        );

        setSlots(response.data || []);
        setSelectedSlot("");
      } catch (err) {
        console.error("LOAD SLOTS ERROR:", err);

        setSlots([]);

        setError(
          err.response?.data?.message ||
          "Không thể tải khung giờ.",
        );
      } finally {
        setSlotLoading(false);
      }
    };

    loadSlots();
  }, [selectedStylist, selectedService, date]);

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedStylist) {
      setError("Vui lòng chọn stylist.");
      return;
    }

    if (!selectedService || !date || !selectedSlot) {
      setError(
        "Vui lòng chọn đầy đủ dịch vụ, ngày và giờ.",
      );

      return;
    }

    try {
      setSubmitting(true);

      const response = await authApis().post(
        endpoints.appointments,
        {
          stylistId: Number(selectedStylist),
          serviceId: Number(selectedService),
          appointmentDate: date,
          startTime: selectedSlot,
          customerNote: note || null,
        },
      );

      const appointment = response.data;

      setSuccess(
        "Tạo lịch hẹn thành công. Đang chuyển đến thanh toán...",
      );

      const paymentResponse = await authApis().post(
        endpoints.vnpayCreate,
        null,
        {
          params: {
            appointmentId: appointment.id,
          },
        },
      );

      if (!paymentResponse.data?.paymentUrl) {
        throw new Error(
          "Không nhận được đường dẫn thanh toán VNPay.",
        );
      }

      window.location.href =
        paymentResponse.data.paymentUrl;
    } catch (err) {
      console.error(
        "CREATE APPOINTMENT ERROR:",
        err,
      );

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
        "Đặt lịch thất bại.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="booking-page">
        <div className="booking-container">
          <div className="booking-loading">
            <div className="booking-loading-spinner"></div>
            <p>Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="booking-page">
      <div className="booking-container">

        {/* ================= BACK ================= */}

        <button
          type="button"
          className="booking-back-button"
          onClick={handleBack}
        >
          <span>←</span>
          <span>QUAY LẠI</span>
        </button>

        {/* ================= TITLE ================= */}

        <div className="booking-title">
          <p className="page-label">
            BOOK APPOINTMENT
          </p>

          <h1>
            {stylist
              ? `Đặt lịch với ${stylist.firstName || ""
                } ${stylist.lastName || ""
                }`.trim()
              : "Đặt lịch hẹn"}
          </h1>
        </div>

        {error && (
          <div className="booking-alert error">
            {error}
          </div>
        )}

        {success && (
          <div className="booking-alert success">
            {success}
          </div>
        )}

        <form
          className="booking-form"
          onSubmit={handleSubmit}
        >

          {/* ================= STYLIST ================= */}

          <div className="booking-field">
            <label>Stylist</label>

            <select
              value={selectedStylist}
              onChange={(e) =>
                setSelectedStylist(e.target.value)
              }
              required
            >
              <option value="">
                -- Chọn stylist --
              </option>

              {stylists.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.firstName || ""}{" "}
                  {item.lastName || ""}
                </option>
              ))}
            </select>
          </div>

          {/* ================= SERVICE ================= */}

          <div className="booking-field">
            <label>Dịch vụ</label>

            <select
              value={selectedService}
              onChange={(e) =>
                setSelectedService(e.target.value)
              }
              required
              disabled={!selectedStylist}
            >
              <option value="">
                -- Chọn dịch vụ --
              </option>

              {services.map((service) => (
                <option
                  key={service.id}
                  value={service.id}
                >
                  {service.name} -{" "}
                  {Number(
                    service.price || 0,
                  ).toLocaleString("vi-VN")}
                  đ
                </option>
              ))}
            </select>
          </div>

          {/* ================= DATE ================= */}

          <div className="booking-field">
            <label>Ngày</label>

            <input
              type="date"
              value={date}
              min={
                new Date()
                  .toISOString()
                  .split("T")[0]
              }
              onChange={(e) =>
                setDate(e.target.value)
              }
              disabled={!selectedService}
              required
            />
          </div>

          {/* ================= TIME ================= */}

          <div className="booking-field">
            <label>Khung giờ</label>

            {slotLoading ? (
              <p>
                Đang tải khung giờ...
              </p>
            ) : (
              <div className="slot-grid">
                {slots.length === 0 ? (
                  <p className="slot-empty">
                    {date
                      ? "Chưa có khung giờ khả dụng."
                      : "Vui lòng chọn ngày."}
                  </p>
                ) : (
                  slots.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      className={`slot-button ${selectedSlot === slot
                        ? "selected"
                        : ""
                        }`}
                      onClick={() =>
                        setSelectedSlot(slot)
                      }
                    >
                      {slot}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* ================= NOTE ================= */}

          <div className="booking-field">
            <label>Ghi chú</label>

            <textarea
              value={note}
              onChange={(e) =>
                setNote(e.target.value)
              }
              placeholder="Ví dụ: muốn cắt ngắn hơn, không dùng sản phẩm tạo kiểu..."
              rows="4"
            />
          </div>

          {/* ================= SUBMIT ================= */}

          <button
            className="gold-button submit-booking"
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? "ĐANG ĐẶT LỊCH..."
              : "XÁC NHẬN ĐẶT LỊCH"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default BookingScreen;
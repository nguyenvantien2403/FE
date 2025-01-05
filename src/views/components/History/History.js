import useOrder from "@api/useOrder";
import usePayment from "@api/usePayment";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useUser from "@store/useUser";
import { Button, Pagination, Space, Table } from "antd";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

function History() {
    const { token } = useUser();
    const { getAll } = useOrder();
    const [orders, setOrder] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState();
    const [tableParams, setTableParams] = useState({
        pagination: {
            pageIndex: 1,
            pageSize: 10,
        },
    });

    const { createPayment } = usePayment();

    const fetchData = async () => {
        const { success, data } = await getAll({
            ...tableParams.pagination,
            UserId: jwtDecode(token).user_id,
        });

        if (success && data.status !== "Error") {
            if (data.data !== null) {
                setOrder(data.data.items);
                setTotal(data.data.totalCount);
            }
            setLoading(false);
        } else {
            toast.error(data.message);
        }
    };

    useEffect(() => {
        fetchData();
    }, [JSON.stringify(tableParams), loading]);

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });
        if (pagination.pageSize !== tableParams.pagination?.pageSize) {
            setOrder([]);
        }
    };

    const onShowSizeChange = (current, pageSize) => {
        setTableParams({
            pagination: {
                pageIndex: current,
                pageSize: pageSize,
            },
        });
    };

    const handlePayment = async (id) => {
        try {
            // Gửi yêu cầu tới backend để tạo thanh toán
            const { data, success } = await createPayment({
                OrderId: id, // ID của đơn hàng
                ReturnUrl: "payment-result", // URL trả về sau khi thanh toán
            });
            if (success) {
                console.log(data);
                // Nhận URL thanh toán từ backend
                const paymentUrl = data.url;
                console.log(paymentUrl);
                // Chuyển hướng người dùng đến trang thanh toán VNPay
                window.location.href = paymentUrl;
            }
        } catch (error) {
            console.error("Lỗi khi tạo thanh toán:", error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: "FullName",
            render: (data) => {
                return <p>{`${data.firstName} ${data.lastName}`}</p>;
            },
        },
        {
            title: "Address",
            dataIndex: "address",
            key: "address",
        },
        {
            title: "Phone",
            dataIndex: "mobile",
            key: "mobile",
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
        },
        {
            title: "Price",
            dataIndex: "totalPrice",
            key: "totalPrice",
            render: (_, record) => <p>{record.totalPrice} đ</p>,
        },
        {
            title: "Thanh Toán",
            key: "payment",
            render: (_, record) => (
                <Button
                    type="primary"
                    onClick={() => {
                        handlePayment(record.id);
                    }}
                >
                    Thanh Toán
                </Button>
            ),
        },
    ];

    return (
        <>
            <Table
                dataSource={orders}
                columns={columns}
                pagination={false}
                loading={loading}
                onChange={handleTableChange}
            />
            <Pagination
                showSizeChanger
                onChange={onShowSizeChange}
                style={{ textAlign: "center", marginTop: "1.5rem" }}
                defaultCurrent={tableParams.pagination.pageIndex}
                total={total}
            />
        </>
    );
}

export default History;

import useRequest from "./useRequest";

const usePayment = () => {
    const { createPostRequest, createGetRequest } = useRequest("Payment");
    const createPayment = async (data) =>
        createPostRequest({
            endpoint: "/create-payment",
            data: data,
        });

    return {
        createPayment,
    };
};
export default usePayment;

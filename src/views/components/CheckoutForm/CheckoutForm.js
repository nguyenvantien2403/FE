import useOrder from "@api/useOrder";
import { validateChangeAndBlurInput } from "@utils/validateChangeAndBlurInput";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { CHOXACNHAN } from "../../../constants/orderStatusConstant";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import useUser from "@store/useUser";

function formatCurrencyVND(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
} 
  
const CheckoutForm = () => {


  const productList = useSelector((state) => state.products.productList.map(items => {
    console.log(items);
    return {
      price: items.price,
      imgSrc: items.imgSrc,
      count: items.count,
      ProductId: items.id,
      name: items.name
    }
  }));

  console.log(productList)
  const totalCost = useSelector((state) => state.products.totalCost);


  const {create} = useOrder();
  const {token} = useUser();

  const [totalPriceAfterAddShipping, setTotalPriceAfterAddShipping] =
    useState(totalCost);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    mobile: "",
    email: "",
    createAccount: false,
    shipToDifferentAddress: false,
    orderNotes: "",
    totalPrice: totalCost,
    Carts: productList,
    Status: CHOXACNHAN,
    UserId: jwtDecode(token).user_id
  });

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const navigate = useNavigate()
  const handleSubmit = async (event) => {
    const {success,data} = await create(formData)
    if(data.status != 'Error' && success) {
      toast.success('Đặt hành thành công');
      navigate('/shop')
    } else {
      toast.error('Có lỗi xảy ra');
    }
  };

  const [shippingCost, setShippingCost] = useState(0);

  const handleShippingChange = (event) => {
    const { id, checked } = event.target;
    let newShippingCost = shippingCost;

    switch (id) {
      case "Shipping-1":
        newShippingCost = checked ? newShippingCost : 0;
        break;
      case "Shipping-2":
        newShippingCost = checked ? newShippingCost + 15 : newShippingCost - 15;
        break;
      case "Shipping-3":
        newShippingCost = checked ? newShippingCost + 8 : newShippingCost - 8;
        break;
      default:
        break;
    }

    setShippingCost(newShippingCost);
  };

  useEffect(() => {
    setTotalPriceAfterAddShipping((+totalCost + shippingCost).toFixed(2));
    setFormData({
      ...formData,
      totalPrice: totalPriceAfterAddShipping,
    });
  }, [shippingCost]);

  //validate

  const validate = (values) => {
    const errors = {};

    if (!values.firstName) {
      errors.firstName = "Please enter your first name";
    } else if (values.firstName.length <= 3) {
      errors.firstName = "First name must be at least 3 characters";
    } else if (values.firstName.length >= 50) {
      errors.firstName = "First name must not exceed 50 characters";
    }

    if (!values.lastName) {
      errors.lastName = "Please enter your last name";
    } else if (values.lastName.length <= 3) {
      errors.lastName = "Last name must be at least 3 characters";
    } else if (values.lastName.length >= 50) {
      errors.lastName = "Last name must not exceed 50 characters";
    }

    if (!values.companyName) {
      errors.companyName = "Please enter your company name";
    } else if (values.companyName.length <= 3) {
      errors.companyName = "Company name must be at least 3 characters";
    } else if (values.companyName.length >= 100) {
      errors.companyName = "Company name must not exceed 50 characters";
    }

    if (!values.address) {
      errors.address = "Please enter your address";
    } else if (values.address.length <= 3) {
      errors.address = "Address must be at least 3 characters";
    } else if (values.address.length >= 200) {
      errors.address = "Address must not exceed 100 characters";
    }

    if (!values.townCity) {
      errors.townCity = "Please enter your town/city";
    } else if (values.townCity.length <= 3) {
      errors.townCity = "Town/city must be at least 3 characters";
    } else if (values.townCity.length >= 100) {
      errors.townCity = "Town/city must not exceed 50 characters";
    }

    if (!values.country) {
      errors.country = "Please enter your country";
    } else if (values.country.length <= 3) {
      errors.country = "Country must be at least 3 characters";
    } else if (values.country.length >= 100) {
      errors.country = "Country must not exceed 50 characters";
    }

    if (!values.postCode) {
      errors.postCode = "Please enter your postcode/zip";
    } else if (!/^[a-zA-Z0-9]{3,}$/.test(values.postCode)) {
      errors.postCode = "Invalid postcode/zip";
    }

    if (!values.email) {
      errors.email = "Please enter your email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = "Invalid email address";
    }

    if (!values.mobile) {
      errors.mobile = "Please enter your phone number";
    } else if (!/^\d{10}$/.test(values.mobile)) {
      errors.mobile = "Invalid phone number";
    }

    if (values.orderNotes.length >= 500) {
      errors.orderNotes = "Order notes must not exceed 500 characters";
    }

    return errors;
  };

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastname: "",
      address: "",
      email: "",
      mobile: "",
      orderNotes: "",
    },
    validate,

    onSubmit: (values) => {
      console.log(JSON.stringify(values, null, 2));
    },
  });

  return (
    <>
      <div class="container-fluid py-5">
        <div class="container py-5">
          <h1 class="mb-4">Billing details</h1>
          <form action="#" onSubmit={formik.handleSubmit}>
            <div class="row g-5">
              <div class="col-md-12 col-lg-6 col-xl-7">
                <div class="row">
                  <div class="col-md-12 col-lg-6">
                    <div class="form-item w-100">
                      <label class="form-label my-3">
                        First Name<sup>*</sup>
                      </label>
                      <input
                        type="text" 
                        class={`form-control ${
                          formik.touched.firstName
                            ? formik.errors.firstName
                              ? "is-invalid"
                              : "is-valid"
                            : ""
                        }`}
                        name="firstName"
                        value={formik.values.firstName} 
            

                        onChange={(e) =>
                          {
                            handleInputChange(e)
                            validateChangeAndBlurInput(e, "firstName", formik)

                          }
                        }
                      />
                      {formik.touched.firstName && formik.errors.firstName ? (
                        <div className="invalid-feedback">
                          {formik.errors.firstName}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div class="col-md-12 col-lg-6">
                    <div class="form-item w-100">
                      <label class="form-label my-3">
                        Last Name<sup>*</sup>
                      </label>
                      <input
                        type="text"
                        class={`form-control ${
                          formik.touched.lastName
                            ? formik.errors.lastName
                              ? "is-invalid"
                              : "is-valid"
                            : ""
                        }`}
                        name="lastName"
                        value={formik.values.lastName}
                        
                        onChange={(e) =>
                         {
                          handleInputChange(e)
                          validateChangeAndBlurInput(e, "lastName", formik)
                         }
                        }
                      />
                      {formik.touched.lastName && formik.errors.lastName ? (
                        <div className="invalid-feedback">
                          {formik.errors.lastName}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              
                <div class="form-item">
                  <label class="form-label my-3">
                    Address <sup>*</sup>
                  </label>
                  <input
                    type="text"
                    class={`form-control ${
                      formik.touched.address
                        ? formik.errors.address
                          ? "is-invalid"
                          : "is-valid"
                        : ""
                    }`}
                    name="address"
                    value={formik.values.address}
                    onChange={(e) =>
                      {
                        handleInputChange(e)
                        
                        validateChangeAndBlurInput(e, "address", formik)

                      }
                    }
                    placeholder="House Number Street Name"
                  />

                  {formik.touched.address && formik.errors.address ? (
                    <div className="invalid-feedback">
                      {formik.errors.address}
                    </div>
                  ) : null}
                </div>
              
                <div class="form-item">
                  <label class="form-label my-3">
                    Mobile<sup>*</sup>
                  </label>
                  <input
                    type="tel"
                    class={`form-control ${
                      formik.touched.mobile
                        ? formik.errors.mobile
                          ? "is-invalid"
                          : "is-valid"
                        : ""
                    }`}
                    name="mobile"
                    value={formik.values.mobile}
                    onChange={(e) =>
                      {
                        handleInputChange(e)
                        validateChangeAndBlurInput(e, "mobile", formik)

                      }
                    }
                  />

                  {formik.touched.mobile && formik.errors.mobile ? (
                    <div className="invalid-feedback">
                      {formik.errors.mobile}
                    </div>
                  ) : null}
                </div>
                <div class="form-item">
                  <label class="form-label my-3">
                    Email Address<sup>*</sup>
                  </label>
                  <input
                    type="email"
                    class={`form-control ${
                      formik.touched.email
                        ? formik.errors.email
                          ? "is-invalid"
                          : "is-valid"
                        : ""
                    }`}
                    name="email"
                    value={formik.values.email}
                    onChange={(e) =>
                      {
                        handleInputChange(e)
                        validateChangeAndBlurInput(e, "email", formik)
                      }
                    }
                  />

                  {formik.touched.email && formik.errors.email ? (
                    <div className="invalid-feedback">
                      {formik.errors.email}
                    </div>
                  ) : null}
                </div>
                <hr />
            
                <div class="form-item">
                  <textarea
                    name="orderNotes"
                    class={`form-control ${
                      formik.touched.orderNotes
                        ? formik.errors.orderNotes
                          ? "is-invalid"
                          : "is-valid"
                        : ""
                    }`}
                    spellcheck="false"
                    cols="100"
                    onChange={(e) =>
                      {
                        handleInputChange(e)
                      validateChangeAndBlurInput(e, "orderNotes", formik)

                      }
                    }
                    value={formik.values.orderNotes}
                    placeholder="Order Notes (Optional)"
                  ></textarea>

                  {formik.touched.orderNotes && formik.errors.orderNotes ? (
                    <div className="invalid-feedback">
                      {formik.errors.orderNotes}
                    </div>
                  ) : null}
                </div>
                <button
                  type="submit"
                  class="btn border-secondary py-3 px-4 text-uppercase w-100 text-primary mt-4"
                  onClick={handleSubmit}
                >
                  Place Order
                </button>
              </div>

              {/* =========================================================== */}
              <div class="col-md-12 col-lg-6 col-xl-5">
                <div class="table-responsive">
                  <table class="table">
                    <thead>
                      <tr>
                        <th scope="col">Products</th>
                        <th scope="col">Name</th>
                        <th scope="col">Price</th>
                        <th scope="col">Quantity</th>
                        <th scope="col">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productList.map((product) => (
                        <tr key={product.id}>
                          <th scope="row">
                            <div class="d-flex align-items-center mt-2">
                              <img
                                src={product.imgSrc}
                                class="img-fluid rounded-circle"
                                style={{ width: "90px", height: "90px" }}
                                alt=""
                              />
                            </div>
                          </th>
                          <td class="py-5">{product.name}</td>
                          <td class="py-5">{formatCurrencyVND(product.price)}</td>
                          <td class="py-5">{product.count}</td>
                          <td class="py-5">{formatCurrencyVND(product.count * product.price)}</td>
                        </tr>
                      ))}

                      <tr>
                        <th scope="row"></th>
                        <td class="py-5"></td>
                        <td class="py-5"></td>
                        <td class="py-5">
                          <p class="mb-0 text-dark py-3">TOTAL</p>
                        </td>
                        <td class="py-5">
                          <div class="py-3 border-bottom border-top">
                            <p class="mb-0 text-dark">{formatCurrencyVND(totalCost)}</p>
                          </div>
                        </td>
                      </tr>
                      {/* <tr>
                        <th scope="row"></th>
                        <td class="py-5">
                          <p class="mb-0 text-dark py-4">Shipping</p>
                        </td>
                        <td colspan="3" class="py-5">
                          <div class="form-check text-start">
                            <input
                              type="checkbox"
                              class="form-check-input bg-primary border-0"
                              id="Shipping-1"
                              name="Shipping-1"
                              value="Shipping"
                              onChange={handleShippingChange}
                            />
                            <label class="form-check-label" for="Shipping-1">
                              Free Shipping
                            </label>
                          </div>
                          <div class="form-check text-start">
                            <input
                              type="checkbox"
                              class="form-check-input bg-primary border-0"
                              id="Shipping-2"
                              name="Shipping-1"
                              value="Shipping"
                              onChange={handleShippingChange}
                            />
                            <label class="form-check-label" for="Shipping-2">
                              Flat rate: {formatCurrencyVND(15000)}
                            </label>
                          </div>
                          <div class="form-check text-start">
                            <input
                              type="checkbox"
                              class="form-check-input bg-primary border-0"
                              id="Shipping-3"
                              name="Shipping-1"
                              value="Shipping"
                              onChange={handleShippingChange}
                            />
                            <label class="form-check-label" for="Shipping-3">
                              Local Pickup: {formatCurrencyVND(8000)}
                            </label>
                          </div>
                        </td>
                      </tr> */}
                      {/* <tr>
                        <th scope="row"></th>
                        <td class="py-5">
                          <p class="mb-0 text-dark text-uppercase py-3">
                            TOTAL
                          </p>
                        </td>
                        <td class="py-5"></td>
                        <td class="py-5"></td>
                        <td class="py-5">
                          <div class="py-3 border-bottom border-top">
                            <p class="mb-0 text-dark">
                              {formatCurrencyVND(totalPriceAfterAddShipping)}
                            </p>
                          </div>
                        </td>
                      </tr> */}
                    </tbody>
                  </table>
                </div>
                {/* <div class="row g-4 text-center align-items-center justify-content-center border-bottom py-3"> */}
                  {/* <div class="col-12">
                    <div class="form-check text-start my-3">
                      <input
                        type="checkbox"
                        class="form-check-input bg-primary border-0"
                        id="Transfer-1"
                        name="Transfer"
                        value="Transfer"
                      />
                      <label class="form-check-label" for="Transfer-1">
                        Direct Bank Transfer
                      </label>
                    </div>
                    <p class="text-start text-dark">
                      Make your payment directly into our bank account. Please
                      use your Order ID as the payment reference. Your order
                      will not be shipped until the funds have cleared in our
                      account.
                    </p>
                  </div> */}
                {/* </div> */}
                {/* <div class="row g-4 text-center align-items-center justify-content-center border-bottom py-3">
                  <div class="col-12">
                    <div class="form-check text-start my-3">
                      <input
                        type="checkbox"
                        class="form-check-input bg-primary border-0"
                        id="Payments-1"
                        name="Payments"
                        value="Payments"
                      />
                      <label class="form-check-label" for="Payments-1">
                        Check Payments
                      </label>
                    </div>
                  </div>
                </div>
                <div class="row g-4 text-center align-items-center justify-content-center border-bottom py-3">
                  <div class="col-12">
                    <div class="form-check text-start my-3">
                      <input
                        type="checkbox"
                        class="form-check-input bg-primary border-0"
                        id="Delivery-1"
                        name="Delivery"
                        value="Delivery"
                      />
                      <label class="form-check-label" for="Delivery-1">
                        Cash On Delivery
                      </label>
                    </div>
                  </div>
                </div>
                <div class="row g-4 text-center align-items-center justify-content-center border-bottom py-3">
                  <div class="col-12">
                    <div class="form-check text-start my-3">
                      <input
                        type="checkbox"
                        class="form-check-input bg-primary border-0"
                        id="Paypal-1"
                        name="Paypal"
                        value="Paypal"
                      />
                      <label class="form-check-label" for="Paypal-1">
                        Paypal
                      </label>
                    </div>
                  </div>
                </div> */}
                
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CheckoutForm;

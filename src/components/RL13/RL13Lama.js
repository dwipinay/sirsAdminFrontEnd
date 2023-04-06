import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import style from "./FormTambahRL13.module.css";
import { useNavigate } from "react-router-dom";
import { HiSaveAs } from "react-icons/hi";
import { RiDeleteBin5Fill, RiEdit2Fill } from "react-icons/ri";
import { AiFillFileAdd } from "react-icons/ai";
import "react-toastify/dist/ReactToastify.css";
import Table from "react-bootstrap/Table";
import { confirmAlert } from "react-confirm-alert";
import { ToastContainer, toast } from "react-toastify";
import "react-confirm-alert/src/react-confirm-alert.css";
import Spinner from "react-bootstrap/Spinner";
import { DownloadTableExcel } from "react-export-table-to-excel";
import { Typeahead } from "react-bootstrap-typeahead";
import Select from "react-select";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";

const RL13 = () => {
  const [namaPropinsi, setNamaPropinsi] = useState("");
  const [namaKabKota, setNamaKabKota] = useState("");
  const [tahun, setTahun] = useState(new Date().getFullYear() - 1);
  const [alamatRS, setAlamatRS] = useState("");
  const [dataRL, setDataRL] = useState([]);
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const navigate = useNavigate();
  const [spinner, setSpinner] = useState(false);
  const [options, setOptions] = useState([]);
  const [optionsrs, setOptionsRS] = useState([]);
  const [idkabkota, setIdKabKota] = useState("");
  const [idrs, setIdRS] = useState("");
  const tableRef = useRef(null);
  const [namafile, setNamaFile] = useState("");
  const [namaRS, setNamaRS] = useState("");
  const [namakabkota, setKabKota] = useState("");
  const [statusValidasi, setStatusValidasi] = useState({
    value: 3,
    label: "Belum divalidasi",
  });
  const [statusValidasiId, setStatusValidasiId] = useState(3);
  const [optionStatusValidasi, setOptionStatusValidasi] = useState([]);
  const [catatan, setCatatan] = useState("");
  const [buttonStatus, setButtonStatus] = useState(true);
  const [statusDataValidasi, setStatusDataValidasi] = useState();
  const [kategoriUser, setKategoriUser] = useState();
  const [Buttonsearch, setButtonsearch] = useState(true);
  const [statusRecordValidasi, setStatusRecordValidasi] = useState("post")
  const [validasiId, setValidasiId] = useState(null)

  useEffect(() => {
    refreshToken();
    getDataKabkota();
    getStatusValidasi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshToken = async () => {
    try {
      const response = await axios.get("/apisirs/token");
      setToken(response.data.accessToken);
      const decoded = jwt_decode(response.data.accessToken);
      setExpire(decoded.exp);
      setKategoriUser(decoded.jenis_user_id);
    } catch (error) {
      if (error.response) {
        navigate("/");
      }
    }
  };

  const axiosJWT = axios.create();
  axiosJWT.interceptors.request.use(
    async (config) => {
      const currentDate = new Date();
      if (expire * 1000 < currentDate.getTime()) {
        const response = await axios.get("/apisirs/token");
        config.headers.Authorization = `Bearer ${response.data.accessToken}`;
        setToken(response.data.accessToken);
        const decoded = jwt_decode(response.data.accessToken);
        setExpire(decoded.exp);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const getDataKabkota = async () => {
    try {
      const response = await axiosJWT.get("/apisirs/kabkota");
      const kabkotaDetails = response.data.data.map((value) => {
        return value;
      });

      const results = [];
      kabkotaDetails.forEach((value) => {
        results.push({
          key: value.nama,
          value: value.id,
        });
      });
      // Update the options state
      setOptions([{ key: "Piih Kab/Kota", value: "" }, ...results]);
    } catch (error) {
      if (error.response) {
        navigate("/");
      }
    }
  };

  const getStatusValidasi = async () => {
    try {
      const response = await axios.get("/apisirs/statusvalidasi");
      const statusValidasiTemplate = response.data.data.map((value, index) => {
        return {
          value: value.id,
          label: value.nama,
        };
      });
      setOptionStatusValidasi(statusValidasiTemplate);
    } catch (error) {
      console.log(error);
    }
  };

  const searchRS = async (e) => {
    setButtonStatus(true);
    setCatatan(" ");
    setStatusValidasi({
      value: 3,
      label: "Belum divalidasi",
    });
    setButtonsearch(true);
    setOptionsRS([]);
    if (e.target.value.length > 0) {
      try {
        const responseRS = await axiosJWT.get(
          "/apisirs/rumahsakit?kabkotaid=" + e.target.value,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const DetailRS = responseRS.data.data.map((value) => {
          return value;
        });
        const resultsRS = [];

        DetailRS.forEach((value) => {
          resultsRS.push({
            key: value.RUMAH_SAKIT,
            value: value.Propinsi,
          });
        });
        // // Update the options state
        setIdKabKota(e.target.value);
        setOptionsRS([...resultsRS]);
        // setKabKota(e.target.options[e.target.selectedIndex].text);
      } catch (error) {
        if (error.response) {
          console.log(error);
        }
      }
    }
  };

  const changeHandlerSingle = (event) => {
    setButtonStatus(true);
    setTahun(event.target.value);
  };

  const changeHandlerCatatan = (event) => {
    setCatatan(event.target.value);
  };

  const changeHandlerRS = (event) => {
    setButtonStatus(true);
    setCatatan(" ");
    setStatusValidasi({
      value: 3,
      label: "Belum divalidasi",
    });
    setIdRS(event.target.value);
    setButtonsearch(false);
  };

  const changeHandlerStatusValidasi = (selectedOption) => {
    setStatusValidasiId(parseInt(selectedOption.value));
    setStatusValidasi(selectedOption);
  };

  const Validasi = async (e) => {
    e.preventDefault();
    setSpinner(true);
    let date = tahun + "-01-01";
    if (statusRecordValidasi == 'post') { 
      try {
        const customConfig = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        };
        const result = await axiosJWT.post(
          "/apisirs/validasi",
          {
            rsId: idrs,
            rlId: 27,
            tahun: date,
            statusValidasiId: statusValidasiId,
            catatan: catatan,
          },
          customConfig
        );
        setSpinner(false);
        toast("Data Berhasil Disimpan", {
          position: toast.POSITION.TOP_RIGHT,
        });
        setValidasiId(result.data.data.id)
        setStatusRecordValidasi('patch')
      } catch (error) {
        toast(
          `Data tidak bisa disimpan karena ,${error.response.data.message}`,
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
        setSpinner(false);
      }
    } else if (statusRecordValidasi == 'patch') {
      try {
        const customConfig = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        };
        await axiosJWT.patch(
          "/apisirs/validasi/" + validasiId,
          {
            statusValidasiId: statusValidasiId,
            catatan: catatan,
          },
          customConfig
        );
        setSpinner(false);
        toast("Data Berhasil Diupdate", {
          position: toast.POSITION.TOP_RIGHT,
        });
      } catch (error) {
        console.log(error);
        toast("Data Gagal Diupdate", {
          position: toast.POSITION.TOP_RIGHT,
        });
        setButtonStatus(false);
        setSpinner(false);
      }
    }

    // if (statusValidasiId === 3) {
    //   alert("Silahkan pilih status validasi terlebih dahulu");
    //   setSpinner(false);
    // } else {
    //   if (statusValidasiId === 2 && catatan === "") {
    //     alert("Silahkan isi catatan apabila laporan tidak valid");
    //     setSpinner(false);
    //   } else if (idrs === "") {
    //     alert("Silahkan pilih rumah sakit");
    //     setSpinner(false);
    //   } else {
    //     try {
    //       const customConfig = {
    //         headers: {
    //           "Content-Type": "application/json",
    //           Authorization: `Bearer ${token}`,
    //         },
    //         params: {
    //           rsid: idrs,
    //           rlid: 27,
    //           tahun: date,
    //         },
    //       };
    //       const results = await axiosJWT.get("/apisirs/validasi", customConfig);

    //       if (results.data.data == null) {
    //       } else {
    //         setStatusDataValidasi(results.data.data.id);
    //       }
    //     } catch (error) {
    //       console.log(error);
    //     }

    //     if (statusDataValidasi == null) {
    //       try {
    //         const customConfig = {
    //           headers: {
    //             "Content-Type": "application/json",
    //             Authorization: `Bearer ${token}`,
    //           },
    //         };
    //         const result = await axiosJWT.post(
    //           "/apisirs/validasi",
    //           {
    //             rsId: idrs,
    //             rlId: 27,
    //             tahun: date,
    //             statusValidasiId: statusValidasiId,
    //             catatan: catatan,
    //           },
    //           customConfig
    //         );
    //         // console.log(result.data)
    //         setSpinner(false);
    //         toast("Data Berhasil Disimpan", {
    //           position: toast.POSITION.TOP_RIGHT,
    //         });
    //       } catch (error) {
    //         toast(
    //           `Data tidak bisa disimpan karena ,${error.response.data.message}`,
    //           {
    //             position: toast.POSITION.TOP_RIGHT,
    //           }
    //         );
    //         setSpinner(false);
    //       }
    //     } else {
    //       try {
    //         const customConfig = {
    //           headers: {
    //             "Content-Type": "application/json",
    //             Authorization: `Bearer ${token}`,
    //           },
    //         };
    //         await axiosJWT.patch(
    //           "/apisirs/validasi/" + statusDataValidasi,
    //           {
    //             statusValidasiId: statusValidasiId,
    //             catatan: catatan,
    //           },
    //           customConfig
    //         );
    //         setSpinner(false);
    //         toast("Data Berhasil Diupdate", {
    //           position: toast.POSITION.TOP_RIGHT,
    //         });
    //       } catch (error) {
    //         console.log(error);
    //         toast("Data Gagal Diupdate", {
    //           position: toast.POSITION.TOP_RIGHT,
    //         });
    //         setButtonStatus(false);
    //         setSpinner(false);
    //       }
    //     }

    //     getDataStatusValidasi();
    //   }
    // }
  };

  const getDataStatusValidasi = async () => {
    // e.preventDefault();
    let date = tahun + "-01-01";

    try {
      const customConfig = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        params: {
          rsid: idrs,
          rlid: 27,
          tahun: date,
        },
      };
      const results = await axiosJWT.get("/apisirs/validasi", customConfig);

      if (results.data.data == null) {
        // setStatusDataValidasi()
        // setStatusValidasi({ value: 3, label: "Belum divalidasi" });
        // setCatatan(" ");
        setStatusRecordValidasi('post')
      } else {
        setValidasiId(results.data.data.id)
        setStatusRecordValidasi('patch')
        setStatusValidasi({
          value: results.data.data.status_validasi.id,
          label: results.data.data.status_validasi.nama,
        });
        setCatatan(results.data.data.catatan);
        setStatusDataValidasi(results.data.data.id);
        // alert('hi')
      }
      // console.log(results)
    } catch (error) {
      console.log(error);
    }
  };

  const Cari = async (e) => {
    e.preventDefault();
    setSpinner(true);
    setKabKota(
      e.target.kabkota.options[e.target.kabkota.options.selectedIndex].label
    );
    setButtonStatus(true);
    setCatatan(" ");
    setStatusValidasi({
      value: 3,
      label: "Belum divalidasi",
    });
    if (idrs !== "") {
      try {
        const customConfig = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          params: {
            koders: idrs,
            tahun: tahun,
          },
        };
        const results = await axiosJWT.get(
          "/apisirs/rlsatutitiktigaadmin",
          customConfig
        );

        const rlSatuTitikTigaDetails = results.data.data.map((value) => {
          return value.rl_satu_titik_tiga_details;
        });

        let dataRLSatuTitikTigaDetails = [];
        rlSatuTitikTigaDetails.forEach((element) => {
          element.forEach((value) => {
            dataRLSatuTitikTigaDetails.push(value);
          });
        });

        setDataRL(dataRLSatuTitikTigaDetails);
        setNamaFile("RL1.3_" + idrs);
        setNamaRS(results.data.dataRS.RUMAH_SAKIT);
        setSpinner(false);
        if (kategoriUser === 3 && dataRLSatuTitikTigaDetails.length > 0) {
          setButtonStatus(false);
        } else if (
          kategoriUser === 3 &&
          dataRLSatuTitikTigaDetails.length === 0
        ) {
          setButtonStatus(true);
        }
      } catch (error) {
        console.log(error);
      }
      getDataStatusValidasi();
    } else {
      toast("Filter Tidak Boleh Kosong...", {
        position: toast.POSITION.TOP_RIGHT,
      });
      setSpinner(false);
    }
  };

  return (
    <div className="container" style={{ marginTop: "70px" }}>
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title h5">Validasi RL 1.3</h5>
              <form onSubmit={Validasi}>
                <Select
                  options={optionStatusValidasi}
                  className="form-control"
                  name="status_validasi_id"
                  id="status_validasi_id"
                  onChange={changeHandlerStatusValidasi}
                  value={statusValidasi}
                  isDisabled={buttonStatus}
                />

                {/* <div
                  className="form-floating"
                  style={{ width: "100%", display: "inline-block" }}
                >
                  <input
                    name="catatan"
                    type="text"
                    className="form-control"
                    id="floatingInputCatatan"
                    placeholder="catatan"
                    value={catatan}
                    onChange={(e) => changeHandlerCatatan(e)}
                    disabled={buttonStatus}
                  />
                  <label htmlFor="floatingInputCatatan">Catatan :</label>
                </div> */}
                <FloatingLabel label="Catatan :">
                  <Form.Control
                    as="textarea"
                    name="catatan"
                    placeholder="Leave a comment here"
                    id="floatingInputCatatan"
                    style={{ height: "100px" }}
                    disabled={buttonStatus}
                    value={catatan}
                    onChange={(e) => changeHandlerCatatan(e)}
                  />
                </FloatingLabel>

                <div className="mt-3">
                  <ToastContainer />
                  <button
                    type="submit"
                    disabled={buttonStatus}
                    className="btn btn-outline-success"
                    hidden={buttonStatus}
                  >
                    <HiSaveAs size={20} /> Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title h5">Filter RL 1.3</h5>
              <form onSubmit={Cari}>
                <div className="col-md-12">
                  <div className="row">
                    <div className="col-md-12">
                      <div
                        className="form-floating"
                        style={{ width: "100%", display: "inline-block" }}
                      >
                        <select
                          name="kabkota"
                          typeof="select"
                          className="form-control"
                          id="floatingselect"
                          placeholder="Kab/Kota"
                          onChange={searchRS}
                        >
                          {options.map((option) => {
                            return (
                              <option
                                key={option.value}
                                name={option.key}
                                value={option.value}
                              >
                                {option.key}
                              </option>
                            );
                          })}
                        </select>
                        <label htmlFor="floatingInput">Kab. Kota :</label>
                      </div>
                    </div>

                    <div className="col-md-8">
                      <div
                        className="form-floating"
                        style={{ width: "100%", display: "inline-block" }}
                      >
                        <select
                          name="rumahsakit"
                          typeof="select"
                          className="form-control"
                          id="floatingselect"
                          placeholder="Rumah Sakit"
                          onChange={(e) => changeHandlerRS(e)}
                        >
                          <option value="">Pilih Rumah Sakit</option>
                          {optionsrs.map((option) => {
                            return (
                              <option
                                key={option.value}
                                value={option.value}
                                kelas={option.kelas}
                              >
                                {option.key}
                              </option>
                            );
                          })}
                        </select>
                        <label htmlFor="floatingInput">Rumah Sakit :</label>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div
                        className="form-floating"
                        style={{ width: "100%", display: "inline-block" }}
                      >
                        <input
                          name="tahun"
                          type="text"
                          className="form-control"
                          id="floatingInput"
                          placeholder="Tahun"
                          value={tahun}
                          onChange={(e) => changeHandlerSingle(e)}
                        />
                        <label htmlFor="floatingInput">Tahun</label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <button
                    type="submit"
                    // disabled={Buttonsearch}
                    className="btn btn-outline-success"
                    // hidden={Buttonsearch}
                  >
                    <HiSaveAs /> Cari
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="row mt-3 mb-3">
        <div className="col-md-12">
          <div className="container" style={{ textAlign: "center" }}>
            {spinner && <Spinner animation="grow" variant="success"></Spinner>}
            {spinner && <Spinner animation="grow" variant="success"></Spinner>}
            {spinner && <Spinner animation="grow" variant="success"></Spinner>}
            {spinner && <Spinner animation="grow" variant="success"></Spinner>}
            {spinner && <Spinner animation="grow" variant="success"></Spinner>}
            {spinner && <Spinner animation="grow" variant="success"></Spinner>}
          </div>
          <DownloadTableExcel
            filename={namafile}
            sheet="data RL 1.3"
            currentTableRef={tableRef.current}
          >
            <button className="btn btn-outline-success mb-2">
              Export Excel
            </button>
          </DownloadTableExcel>
          <Table
            className={style.rlTable}
            responsive
            bordered
            style={{ widows: "100%" }}
            ref={tableRef}
          >
            <thead>
              <tr>
                <th rowSpan="2" style={{ width: "4%" }}>
                  No.
                </th>
                <th rowSpan="2" style={{ width: "4%" }}>
                  RL
                </th>
                <th rowSpan="2" style={{ width: "4%" }}>
                  Nama RS
                </th>
                <th rowSpan="2" style={{ width: "4%" }}>
                  Tahun
                </th>
                <th rowSpan="2" style={{ width: "4%" }}>
                  Kab/Kota
                </th>
                <th rowSpan="2" style={{ width: "30%" }}>
                  Jenis Pelayanan
                </th>
                <th rowSpan="2" style={{ width: "15%" }}>
                  Jumlah Tempat Tidur
                </th>
                <th colSpan="6">Kelas</th>
              </tr>
              <tr>
                <th style={{ width: "7%" }}>VVIP</th>
                <th style={{ width: "7%" }}>VIP</th>
                <th style={{ width: "7%" }}>1</th>
                <th style={{ width: "7%" }}>2</th>
                <th style={{ width: "7%" }}>3</th>
                <th style={{ width: "7%" }}>Khusus</th>
              </tr>
            </thead>
            <tbody>
              {dataRL.map((value, index) => {
                return (
                  <tr key={value.id}>
                    <td>
                      <label htmlFor="">{index + 1}</label>
                    </td>
                    <td>RL 1.3</td>
                    <td>{namaRS}</td>
                    <td>{value.tahun}</td>
                    <td>{namakabkota}</td>
                    <td>
                      <label htmlFor="">{value.jenis_pelayanan.nama}</label>
                    </td>
                    <td>
                      <label htmlFor="">{value.jumlah_tempat_tidur}</label>
                    </td>
                    <td>
                      <label htmlFor="">{value.kelas_VIP}</label>
                    </td>
                    <td>
                      <label htmlFor="">{value.kelas_VIP}</label>
                    </td>
                    <td>
                      <label htmlFor="">{value.kelas_1}</label>
                    </td>
                    <td>
                      <label htmlFor="">{value.kelas_2}</label>
                    </td>
                    <td>
                      <label htmlFor="">{value.kelas_3}</label>
                    </td>
                    <td>
                      <label htmlFor="">{value.kelas_khusus}</label>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default RL13;
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import style from "./FormTambahRL39.module.css";
import { useNavigate } from "react-router-dom";
import { HiSaveAs } from "react-icons/hi";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import Table from "react-bootstrap/Table";
import { RiDeleteBin5Fill, RiEdit2Fill } from "react-icons/ri";
import { AiFillFileAdd } from "react-icons/ai";
import Spinner from "react-bootstrap/Spinner";
import { DownloadTableExcel } from "react-export-table-to-excel";
import { Typeahead } from "react-bootstrap-typeahead";
import Select from "react-select";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";

const RL39 = () => {
  const [namaPropinsi, setNamaPropinsi] = useState("");
  const [tahun, setTahun] = useState(new Date().getFullYear() - 1);
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
    // console.log(statusValidasiId)
  };

  const Validasi = async (e) => {
    e.preventDefault();
    setSpinner(true);
    let date = tahun + "-01-01";

    if (statusValidasiId === 3) {
      alert("Silahkan pilih status validasi terlebih dahulu");
      setSpinner(false);
    } else {
      if (statusValidasiId === 2 && catatan === "") {
        alert("Silahkan isi catatan apabila laporan tidak valid");
        setSpinner(false);
      } else if (idrs === "") {
        alert("Silahkan pilih rumah sakit");
        setSpinner(false);
      } else {
        try {
          const customConfig = {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            params: {
              rsid: idrs,
              rlid: 9,
              tahun: date,
            },
          };
          const results = await axiosJWT.get("/apisirs/validasi", customConfig);

          if (results.data.data == null) {
          } else {
            setStatusDataValidasi(results.data.data.id);
          }
        } catch (error) {
          console.log(error);
        }

        if (statusDataValidasi == null) {
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
                rlId: 9,
                tahun: date,
                statusValidasiId: statusValidasiId,
                catatan: catatan,
              },
              customConfig
            );
            // console.log(result.data)
            setSpinner(false);
            toast("Data Berhasil Disimpan", {
              position: toast.POSITION.TOP_RIGHT,
            });
          } catch (error) {
            toast(
              `Data tidak bisa disimpan karena ,${error.response.data.message}`,
              {
                position: toast.POSITION.TOP_RIGHT,
              }
            );
            setSpinner(false);
          }
        } else {
          try {
            const customConfig = {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            };
            await axiosJWT.patch(
              "/apisirs/validasi/" + statusDataValidasi,
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

        getDataStatusValidasi();
      }
    }
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
          rlid: 9,
          tahun: date,
        },
      };
      const results = await axiosJWT.get("/apisirs/validasi", customConfig);

      if (results.data.data == null) {
        // setStatusDataValidasi()
        setStatusValidasi({ value: 3, label: "Belum divalidasi" });
        setCatatan(" ");
      } else {
        setStatusValidasi({
          value: results.data.data.status_validasi.id,
          label: results.data.data.status_validasi.nama,
        });
        setCatatan(results.data.data.catatan);
        setStatusDataValidasi(results.data.data.id);
      }
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
        setSpinner(true);
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
          "/apisirs/rltigatitiksembilanadmin",
          customConfig
        );

        let tahungroup = "";
        const rlTigaTitikSembilanDetails = results.data.data.map((value) => {
          tahungroup = value.tahun;
          return value.rl_tiga_titik_sembilan_details;
        });

        let dataRLTigaTitiksembilanDetails = [];
        rlTigaTitikSembilanDetails.forEach((element) => {
          element.forEach((value) => {
            dataRLTigaTitiksembilanDetails.push(value);
          });
        });

        let sortedProducts = dataRLTigaTitiksembilanDetails.sort((p1, p2) =>
          p1.jenis_tindakan_id > p2.jenis_tindakan_id ? 1 : -1
        );

        let groups = [];
        sortedProducts.reduce(function (res, value) {
          if (!res[value.group_jenis_tindakan.group_jenis_tindakan_header_id]) {
            res[value.group_jenis_tindakan.group_jenis_tindakan_header_id] = {
              groupId:
                value.group_jenis_tindakan.group_jenis_tindakan_header_id,
              groupNama:
                value.group_jenis_tindakan.group_jenis_tindakan_header.nama,
              jumlah: 0,
            };
            groups.push(
              res[value.group_jenis_tindakan.group_jenis_tindakan_header_id]
            );
          }
          res[
            value.group_jenis_tindakan.group_jenis_tindakan_header_id
          ].jumlah += value.jumlah;
          return res;
        }, {});

        let data = [];
        groups.forEach((element) => {
          if (element.groupId != null) {
            const filterData = sortedProducts.filter((value, index) => {
              return (
                value.group_jenis_tindakan.group_jenis_tindakan_header_id ===
                element.groupId
              );
            });
            data.push({
              groupNo: element.groupId,
              groupNama: element.groupNama,
              tahun: tahungroup,
              details: filterData,
              subTotal: element.jumlah,
            });
          }
        });

        setDataRL(data);
        setNamaFile("RL39_" + idrs);
        setSpinner(false);
        setNamaRS(results.data.dataRS.RUMAH_SAKIT);

        if (kategoriUser === 3 && dataRLTigaTitiksembilanDetails.length > 0) {
          setButtonStatus(false);
        } else if (
          kategoriUser === 3 &&
          dataRLTigaTitiksembilanDetails.length === 0
        ) {
          setButtonStatus(true);
        }
      } catch (error) {
        // toast("Get Data Error", {
        //   position: toast.POSITION.TOP_RIGHT,
        // });
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
              <h5 className="card-title h5">Validasi RL 3.9</h5>
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
                  <label htmlFor="floatingInputCatatan">Catatan: </label>
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
                <div className="mt-3 ">
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
              <h5 className="card-title h5">Filter RL 3.9</h5>
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
            sheet="data RL 39"
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
            ref={tableRef}
            // style={{ width: "100%" }}
          >
            <thead>
              <tr>
                <th style={{ width: "4%" }}>No.</th>
                <th style={{ width: "5%" }}>RL</th>
                <th style={{ width: "10%" }}>Nama RS</th>
                <th style={{ width: "5%" }}>Tahun</th>
                <th style={{ width: "10%" }}>Kab/Kota</th>
                <th style={{ width: "15%" }}>Jenis Tindakan</th>
                <th style={{ width: "10%" }}>Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {
                // eslint-disable-next-line
                dataRL.map((value, index) => {
                  if (value.groupNama != null) {
                    return (
                      <React.Fragment key={index}>
                        <tr>
                          {value.groupNo === 9 && <td>-</td>}
                          {value.groupNo !== 9 && <td>{value.groupNo}</td>}
                          <td>RL 3.9</td>
                          <td>{namaRS}</td>
                          <td>{value.tahun}</td>
                          <td>{namakabkota}</td>
                          <td style={{ textAlign: "left" }}>
                            {value.groupNama}
                          </td>
                          <td>{value.subTotal}</td>
                        </tr>
                        {value.details.map((value2, index2) => {
                          return (
                            <tr key={index2}>
                              <td>{value2.group_jenis_tindakan.no}</td>
                              <td>RL 3.9</td>
                              <td>{namaRS}</td>
                              <td>{value2.tahun}</td>
                              <td>{namakabkota}</td>
                              <td style={{ textAlign: "left" }}>
                                &emsp;{value2.group_jenis_tindakan.nama}
                              </td>
                              <td>{value2.jumlah}</td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  } else if (value.groupNama == null) {
                    return (
                      <React.Fragment key={index}>
                        <tr>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td style={{ textAlign: "left" }}>
                            {value.details[0].nama}
                          </td>
                          <td>{value.details[0].nilai}</td>
                        </tr>
                      </React.Fragment>
                    );
                  }
                })
              }
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default RL39;
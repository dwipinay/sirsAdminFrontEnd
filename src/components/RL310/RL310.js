import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import jwt_decode from 'jwt-decode'
import { useNavigate } from 'react-router-dom'
import style from './FormTambahRL310.module.css'
import { HiSaveAs } from 'react-icons/hi'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-confirm-alert/src/react-confirm-alert.css'
import Spinner from "react-bootstrap/esm/Spinner";
import Table from "react-bootstrap/Table";
import { DownloadTableExcel } from "react-export-table-to-excel";
import Select from "react-select";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";


const RL310 = () => {
    const [idrs, setIdRS] = useState("");
    const [options, setOptions] = useState([]);
    const [namakabkota, setKabKota] = useState("");
    const [namafile, setNamaFile] = useState("");
    const tableRef = useRef(null);
    const [optionsrs, setOptionsRS] = useState([]);
    const [idkabkota, setIdKabKota] = useState("");
    const [tahun, setTahun] = useState('2022')
    const [namaRS, setNamaRS] = useState('')
    const [alamatRS, setAlamatRS] = useState('')
    const [namaPropinsi, setNamaPropinsi] = useState('')
    const [namaKabKota, setNamaKabKota] = useState('')
    const [dataRL, setDataRL] = useState([])
    const [token, setToken] = useState('')
    const [expire, setExpire] = useState('')
    const [spinner, setSpinner] = useState(false)
    const navigate = useNavigate()
    const [statusValidasi, setStatusValidasi] = useState({ value: 3, label: 'Belum divalidasi' })
    const [statusValidasiId, setStatusValidasiId] = useState(3)
    const [optionStatusValidasi, setOptionStatusValidasi] = useState([])
    const [catatan, setCatatan] = useState(" ")
    const [buttonStatus, setButtonStatus] = useState(true)
    const [statusDataValidasi, setStatusDataValidasi] = useState()
    const [validateAccess, setValidateAccess] = useState(true)
    const [validateVisibility, setValidateVisibility] = useState("none")
    const [kategoriUser, setKategoriUser] = useState(3)
    const [namaTahun, setNamaTahun] = useState(new Date().getFullYear() - 1);
    const [namakabkotaView, setKabKotaView] = useState("");
    const [statusRecordValidasi, setStatusRecordValidasi] = useState("post");
    const [validasiId, setValidasiId] = useState(null)


    useEffect(() => {
        refreshToken();
        getDataKabkota();
        getStatusValidasi();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const refreshToken = async () => {
        try {
            const response = await axios.get('/apisirs/token')
            setToken(response.data.accessToken)
            const decoded = jwt_decode(response.data.accessToken)
            setExpire(decoded.exp)
            getDataRS(decoded.rsId)
            setKategoriUser(decoded.jenis_user_id);
        } catch (error) {
            if (error.response) {
                navigate('/')
            }
        }
    }

    const axiosJWT = axios.create()
    axiosJWT.interceptors.request.use(async (config) => {
        const currentDate = new Date()
        if (expire * 1000 < currentDate.getTime()) {
            const response = await axios.get('/apisirs/token')
            config.headers.Authorization = `Bearer ${response.data.accessToken}`
            setToken(response.data.accessToken)
            const decoded = jwt_decode(response.data.accessToken)
            setExpire(decoded.exp)
        }
        return config
    }, (error) => {
        return Promise.reject(error)
    })

    const getDataRS = async (id) => {
        try {
            const response = await axiosJWT.get('/apisirs/rumahsakit/' + id, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            // console.log(response.data.data[0].namaRS)
            setNamaRS(response.data.data[0].namaRS)
            setAlamatRS(response.data.data[0].alamat)
            setNamaPropinsi(response.data.data[0].propinsi.nama)
            setNamaKabKota(response.data.data[0].kabKota.nama)
        } catch (error) {

        }
    }

    const getDataRLTigaTitikSepuluh = async (event) => {
        setSpinner(true)
        try {
            const customConfig = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    tahun: event
                }
            }
            const results = await axiosJWT.get('/apisirs/rltigatitiksepuluh',
                customConfig)

            const rlTigaTitikSepuluhDetails = results.data.data.map((value) => {
                return value.rl_tiga_titik_sepuluh_details
            })

            let dataRLTigaTitikSepuluhDetails = []
            rlTigaTitikSepuluhDetails.forEach(element => {
                element.forEach(value => {
                    dataRLTigaTitikSepuluhDetails.push(value)
                })
            })
            let sortedProducts = dataRLTigaTitikSepuluhDetails.sort((p1, p2) =>
                p1.jenis_kegiatan.no > p2.jenis_kegiatan.no
                    ? 1
                    : p1.jenis_kegiatan.no < p2.jenis_kegiatan.no
                        ? -1
                        : 0
            );
            // console.log(sortedProducts)
            setDataRL(dataRLTigaTitikSepuluhDetails)
            setSpinner(false)
        } catch (error) {
            console.log(error)
        }
    }

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
        changeValidateAccessEmpty()
        setStatusValidasi({ value: 3, label: 'Belum divalidasi' })
        setCatatan(' ')
    };

    const searchRS = async (e) => {
        try {
            const responseRS = await axiosJWT.get(
                "/apisirs/rumahsakit/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        kabkotaid: e.target.value
                    }
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
            setKabKota(e.target.options[e.target.selectedIndex].text);
        } catch (error) {
            if (error.response) {
                console.log(error);
            }
        }
        changeValidateAccessEmpty()
        setStatusValidasi({ value: 3, label: 'Belum divalidasi' })
        setCatatan(' ')
    };

    const changeHandlerSingle = (event) => {
        setTahun(event.target.value)
        changeValidateAccessEmpty()
        setStatusValidasi({ value: 3, label: 'Belum divalidasi' })
        setCatatan(' ')
    }

    const changeHandlerCatatan = (event) => {
        setCatatan(event.target.value);
    };

    const changeHandlerRS = (event) => {
        setIdRS(event.target.value);
        changeValidateAccessEmpty()
        setStatusValidasi({ value: 3, label: 'Belum divalidasi' })
        setCatatan(' ')
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
        // setStatusValidasi(3)
    };

    const changeHandlerStatusValidasi = (selectedOption) => {
        setStatusValidasiId(parseInt(selectedOption.value));
        setStatusValidasi(selectedOption);
        // console.log(statusValidasiId)
    };

    const changeNamaTahun = () => {
        setNamaTahun(tahun)
    }

    const changeNamaKota = () => {
        setKabKotaView(namakabkota)
    }

    const changeValidateAccess = () => {
        console.log(kategoriUser)
        if (kategoriUser == 2) {
            setValidateAccess(true)
            setValidateVisibility("none")
        } else if (kategoriUser == 3) {
            setValidateAccess(false)
            setValidateVisibility("block")
        }
        console.log(validateAccess)
    }


    // const changeHandler = (event, index) => {
    //     let newDataRL = [...dataRL]
    //     const name = event.target.name
    //     if (name === 'check') {
    //         if (event.target.checked === true) {
    //             newDataRL[index].disabledInput = false
    //         } else if (event.target.checked === false) {
    //             newDataRL[index].disabledInput = true
    //         }
    //         newDataRL[index].checked = event.target.checked

    //     } else if (name === 'no') {
    //         newDataRL[index].no = event.target.value
    //     } else if (name === 'jenisKegiatan') {
    //         newDataRL[index].jenisKegiatan = event.target.value
    //     } else if (name === 'jumlah') {
    //         newDataRL[index].jumlah = event.target.value
    //     }
    //     setDataRL(newDataRL)
    // }

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
                rlId: 10,
                tahun: date,
                statusValidasiId: statusValidasiId,
                catatan: catatan,
              },
              customConfig
            );
            setStatusRecordValidasi('patch')
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
            toast("data berhasil diubah", {
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
    

        // getDataStatusValidasi()

        /*
        if (statusValidasiId == 3) {
            alert("Silahkan pilih status validasi terlebih dahulu");
            setSpinner(false);
        } else {
            if (statusValidasiId == 2 && catatan == "") {
                alert("Silahkan isi catatan apabila laporan tidak valid");
                setSpinner(false);
            } else if (idrs == "") {
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
                            rlid: 10,
                            tahun: date,
                        },
                    };
                    const results = await axiosJWT.get(
                        "/apisirs/validasi",
                        customConfig
                    );

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
                                rlId: 10,
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
        */
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
                    rlid: 10,
                    tahun: date,
                },
            };
            const results = await axiosJWT.get(
                "/apisirs/validasi",
                customConfig
            );

            if (results.data.data == null) {
                setButtonStatus(false);
                // setStatusDataValidasi()
                setStatusValidasi({ value: 3, label: "Belum divalidasi" });
                setStatusRecordValidasi('post')
            } else {
                setStatusValidasi({
                    value: results.data.data.status_validasi.id,
                    label: results.data.data.status_validasi.nama,
                });
                setCatatan(results.data.data.catatan);
                setButtonStatus(false);
                setStatusDataValidasi(results.data.data.id);
                // alert('hi')
                setValidasiId(results.data.data.id)
                setStatusRecordValidasi('patch')
            }
            // console.log(results)
        } catch (error) {
            console.log(error);
        }
    };

    const changeValidateAccessEmpty = () => {
        setValidateAccess(true)
        setValidateVisibility("none")
    }

    const Cari = async (e) => {
        e.preventDefault()
        changeValidateAccess()
        if (idrs != "") {
            try {
                const customConfig = {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        koders: idrs,
                        tahun: tahun
                    }
                }
                const results = await axiosJWT.get('/apisirs/rltigatitiksepuluhadmin',
                    customConfig
                );


                const rlTigaTitikSepuluhDetails = results.data.data.map((value) => {
                    return value.rl_tiga_titik_sepuluh_details
                })

                let datarlTigaTitikSepuluhDetails = []
                rlTigaTitikSepuluhDetails.forEach(element => {
                    element.forEach(value => {
                        datarlTigaTitikSepuluhDetails.push(value)
                    })
                })
                if (!results.data.data.length) {
                    changeValidateAccessEmpty()
                }
                
                setDataRL(datarlTigaTitikSepuluhDetails);
                setNamaFile("RL310_" + idrs);
                setSpinner(false);
                setNamaRS(results.data.dataRS.RUMAH_SAKIT);
                changeNamaTahun()
                changeNamaKota()
            } catch (error) {
                console.log(error)
            }
        } else {
            toast('Filter tidak boleh kosong', {
                position: toast.POSITION.TOP_RIGHT
            })
            changeValidateAccessEmpty()
        }
        setSpinner(false);
        getDataStatusValidasi();
    };

    return (
        <div className="container" style={{ marginTop: "70px" }}>
            <div className="row">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title h5">Validasi RL 3.10</h5>
                            <form onSubmit={Validasi}>
                                {/* <div className="form-floating" style={{width:"100%", display:"inline-block"}}> */}
                                <Select
                                    options={optionStatusValidasi} className="form-control" name="status_validasi_id" id="status_validasi_id"
                                    onChange={changeHandlerStatusValidasi} value={statusValidasi} isDisabled={validateAccess}
                                />
                                {/* <label htmlFor="status_validasi_id">Status Validasi</label> */}
                                {/* </div> */}
                                <div className="form-floating" style={{ width: "100%", display: "inline-block" }}>
                                    <FloatingLabel label="Catatan :">
                                        <Form.Control
                                            as="textarea"
                                            name="catatan"
                                            placeholder="Leave a comment here"
                                            id="floatingInputCatatan"
                                            style={{ height: "100px" }}
                                            disabled={validateAccess}
                                            value={catatan}
                                            onChange={(e) => changeHandlerCatatan(e)}
                                        />
                                    </FloatingLabel>
                                </div>
                                <div className="mt-3">
                                    <ToastContainer />
                                    <button type="submit" disabled={buttonStatus} style={{ display: validateVisibility }} className="btn btn-outline-success"><HiSaveAs size={20} /> Simpan</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <form onSubmit={Cari}>
                                <h5 className="card-title h5">
                                    Filter RL 3.10
                                </h5>
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

                                <div className="row">
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
                                                        <option key={option.value} value={option.value}>
                                                            {option.key}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                            <label htmlFor="floatingInput">Rumah Sakit :</label>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-floating" style={{ width: "100%", display: "inline-block" }}>
                                            <input
                                                name="tahun"
                                                type="number" min="2022"
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


                                <div className="mt-3">
                                    <button type="submit" className="btn btn-outline-success">
                                        <HiSaveAs /> Cari
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <br></br>
            <DownloadTableExcel
                filename={namafile}
                sheet="data RL 3.10"
                currentTableRef={tableRef.current}
            >
                <button className="btn btn-outline-success mb-2">
              Export Excel
            </button>
            </DownloadTableExcel>
            <div className="row mt-3 mb-3">
                <div className="col-md-12">
                    <Table className={style.rlTable} ref={tableRef}>
                        <thead>
                            <tr>
                                <th
                                    style={{
                                        width: "2%",
                                        textAlign: "center",
                                        verticalAlign: "middle",
                                    }}
                                >
                                    No.
                                </th>
                                <th>RL</th>
                                <th>Nama RS</th>
                                <th>Tahun</th>
                                <th>Kab/Kota</th>
                                <th style={{ "width": "4%" }}>No Kegiatan</th>
                                <th style={{ "width": "50%" }}>Jenis Kegiatan</th>
                                <th>Jumlah</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataRL.map((value, index) => {
                                return (
                                    <tr key={value.id}>
                                        <td
                                            style={{ textAlign: "center", verticalAlign: "middle" }}
                                        >
                                            <label htmlFor="">{index + 1}</label>
                                        </td>
                                        <td>RL 3.10 </td>
                                        <td>{namaRS}</td>
                                        <td>{namaTahun}</td>
                                        <td>{namakabkotaView}</td>
                                        <td>
                                            <label htmlFor="">{value.jenis_kegiatan.no}</label></td>
                                        <td>
                                            <label htmlFor="">{value.jenis_kegiatan.nama}</label></td>
                                        <td>
                                            <label htmlFor="">{value.jumlah}</label></td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </Table>
                </div>
            </div>
            <div className="container" style={{ textAlign: "center" }}>
                {spinner && <Spinner animation="grow" variant="success"></Spinner>}
                {spinner && <Spinner animation="grow" variant="success"></Spinner>}
                {spinner && <Spinner animation="grow" variant="success"></Spinner>}
                {spinner && <Spinner animation="grow" variant="success"></Spinner>}
                {spinner && <Spinner animation="grow" variant="success"></Spinner>}
                {spinner && <Spinner animation="grow" variant="success"></Spinner>}
            </div>
        </div>
    )
}

export default RL310
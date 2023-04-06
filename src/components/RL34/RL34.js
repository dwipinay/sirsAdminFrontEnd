import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import style from "./FormTambahRL34.module.css";
import { useNavigate } from "react-router-dom";
import { HiSaveAs } from "react-icons/hi";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from 'react-toastify';
import "react-confirm-alert/src/react-confirm-alert.css";
import Table from "react-bootstrap/Table";
import Spinner from "react-bootstrap/Spinner";
import { DownloadTableExcel } from "react-export-table-to-excel"
import Select from 'react-select'
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";

const RL34 = () => {
    const [tahun, setTahun] = useState(new Date().getFullYear() - 1);
    const [namaTahun, setNamaTahun] = useState(new Date().getFullYear() - 1);
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
    const [namakabkotaView, setKabKotaView] = useState("");
    const [statusValidasi, setStatusValidasi] = useState({ value: 3, label: 'Belum divalidasi' })
    const [statusRecordValidasi, setStatusRecordValidasi] = useState("post")
    const [statusValidasiId, setStatusValidasiId] = useState(3)
    const [optionStatusValidasi, setOptionStatusValidasi] = useState([])
    const [catatan, setCatatan] = useState(" ")
    const [buttonStatus, setButtonStatus] = useState(true)
    const [statusDataValidasi, setStatusDataValidasi] = useState()
    const [validateAccess, setValidateAccess] = useState(true)
    const [validateVisibility, setValidateVisibility] = useState("none")
    const [kategoriUser, setKategoriUser] = useState(3)
    const [validasiId, setValidasiId] = useState(null)

    useEffect(() => {
        refreshToken();
        getDataKabkota();
        getStatusValidasi()
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
            const response = await axios.get("/apisirs/statusvalidasi")
            const statusValidasiTemplate = response.data.data.map((value, index) => {
                return {
                    value: value.id,
                    label: value.nama
                }
            })
            setOptionStatusValidasi(statusValidasiTemplate)
            
        } catch (error) {
            console.log(error)
        }
        // setStatusValidasi(3)
    }

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
        setTahun(event.target.value);

        changeValidateAccessEmpty()
        setStatusValidasi({ value: 3, label: 'Belum divalidasi' })
        setCatatan(' ')
    };

    const changeHandlerCatatan = (event) => {
        setCatatan(event.target.value);
    };

    const changeHandlerRS = (event) => {
        setIdRS(event.target.value);

        changeValidateAccessEmpty()
        setStatusValidasi({ value: 3, label: 'Belum divalidasi' })
        setCatatan(' ')
    }

    const changeHandlerStatusValidasi = (selectedOption) => {
        setStatusValidasiId(parseInt(selectedOption.value))
        setStatusValidasi(selectedOption)
        // console.log(statusValidasiId)
    }

    const changeNamaTahun = () => {
        setNamaTahun(tahun)
    }

    const changeNamaKota = () => {
        setKabKotaView(namakabkota)
    }

    const changeValidateAccess = () => {
        console.log(kategoriUser)
        if(kategoriUser == 2) {
            setValidateAccess(true)
            setValidateVisibility("none")
        } else if(kategoriUser == 3) {
            setValidateAccess(false)
            setValidateVisibility("block")
        }
        console.log(validateAccess)
    }

    const Validasi = async (e) => {
        e.preventDefault();
        setSpinner(true);
        let date = (tahun+'-01-01');

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
                        rlId: 4,
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
        if(statusValidasiId == 3){
            alert('Silahkan pilih status validasi terlebih dahulu')
            setSpinner(false)
        } else {
            if(statusValidasiId == 2 && catatan == ""){
                alert('Silahkan isi catatan apabila laporan tidak valid')
                setSpinner(false)
            } else if (idrs == "") {
                alert('Silahkan pilih rumah sakit')
                setSpinner(false)
            } else {
                try {
                    const customConfig = {
                        headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                        },
                        params: {
                        rsid: idrs,
                        rlid: 4,
                        tahun: date,
                        },
                    };
                    const results = await axiosJWT.get(
                        "/apisirs/validasi",
                        customConfig
                    )
        
                    if(results.data.data == null){
                        
                    } else {
                        setStatusDataValidasi(results.data.data.id)
                    }
                } catch (error) {
                    console.log(error);
                }

                if(statusDataValidasi == null){
                    try {
                        const customConfig = {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            }
                        }
                        const result = await axiosJWT.post('/apisirs/validasi',{
                            rsId: idrs,
                            rlId: 4,
                            tahun: date,
                            statusValidasiId: statusValidasiId,
                            catatan: catatan
                        }, customConfig)
                        // console.log(result.data)
                        setSpinner(false)
                        toast('Data Berhasil Disimpan', {
                            position: toast.POSITION.TOP_RIGHT
                        })
                    } catch (error) {
                        toast(`Data tidak bisa disimpan karena ,${error.response.data.message}`, {
                            position: toast.POSITION.TOP_RIGHT
                        })
                        setSpinner(false)
                    }
                } else {
                    try {
                        const customConfig = {
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                    }
                                }
                        await axiosJWT.patch('/apisirs/validasi/' + statusDataValidasi, {
                            statusValidasiId: statusValidasiId,
                            catatan: catatan
                        }, customConfig);
                        setSpinner(false)
                        toast('Data Berhasil Diupdate', {
                            position: toast.POSITION.TOP_RIGHT
                        })
                    } catch (error) {
                        console.log(error)
                        toast('Data Gagal Diupdate', {
                            position: toast.POSITION.TOP_RIGHT
                        })
                        setButtonStatus(false)
                        setSpinner(false)
                    }
                }

                getDataStatusValidasi()
            }
        }
        */
    }

    const getDataStatusValidasi = async () => {
        // e.preventDefault();
        let date = (tahun+'-01-01');

        try {
            const customConfig = {
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                },
                params: {
                rsid: idrs,
                rlid: 4,
                tahun: date,
                },
            };
            const results = await axiosJWT.get(
                "/apisirs/validasi",
                customConfig
            )

            if(results.data.data == null){
                setButtonStatus(false)
                // setStatusDataValidasi()
                setStatusValidasi({ value: 3, label: 'Belum divalidasi' })
                setCatatan(' ')
                setStatusRecordValidasi('post')
            } else {
                setValidasiId(results.data.data.id)
                setStatusRecordValidasi('patch')
                setStatusValidasi({ value: results.data.data.status_validasi.id, label: results.data.data.status_validasi.nama })
                setCatatan(results.data.data.catatan)
                setButtonStatus(false)
                setStatusDataValidasi(results.data.data.id)
                // alert('hi')
            }
            // console.log(results)
        } catch (error) {
            console.log(error);
        }
    }

    const changeValidateAccessEmpty = () => {
        setValidateAccess(true)
        setValidateVisibility("none")
    }

    const Cari = async (e) => {
        e.preventDefault();
        setSpinner(true);
        changeValidateAccess()
        if(idrs != ""){
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
                    "/apisirs/rltigatitikempatadmin",
                    customConfig
                );
    
                console.log(results)
                const rlTigaTitikEmpatDetails = results.data.data.map((value) => {
                    return value.rl_tiga_titik_empat_details;
                });
    
                let dataRLTigaTitikEmpatDetails = [];
                rlTigaTitikEmpatDetails.forEach((element) => {
                    element.forEach((value) => {
                    dataRLTigaTitikEmpatDetails.push(value);
                    });
                });
                if(!results.data.data.length){
                    changeValidateAccessEmpty()
                }
                setDataRL(dataRLTigaTitikEmpatDetails);
                setNamaFile("RL34_" + idrs);
                setSpinner(false);
                console.log(dataRL)
                setNamaRS(results.data.dataRS.RUMAH_SAKIT);
                changeNamaTahun()
                changeNamaKota()
                // setKabKota(results.)
            } catch (error) {
                console.log(error);
            }
        } else {
            toast('Filter tidak boleh kosong', {
                position: toast.POSITION.TOP_RIGHT
            })
            changeValidateAccessEmpty()
        }
        
        setSpinner(false)
        getDataStatusValidasi()
    }

    return (
        <div className="container" style={{ marginTop: "70px" }}>
        <div className="row">
            <div className="col-md-6">
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title h5">Validasi RL 3.4</h5>
                        <form onSubmit={Validasi}>
                        {/* <div className="form-floating" style={{width:"100%", display:"inline-block"}}> */}
                            <Select
                                options={optionStatusValidasi} className="form-control" name="status_validasi_id" id="status_validasi_id"
                                onChange={changeHandlerStatusValidasi} value={statusValidasi} isDisabled={validateAccess}
                            />
                            {/* <label htmlFor="status_validasi_id">Status Validasi</label> */}
                        {/* </div> */}
                            <div className="form-floating" style={{width:"100%", display:"inline-block"}}>
                                {/* <input name="catatan" type="text" className="form-control" id="floatingInputCatatan" disabled={validateAccess}
                                    placeholder="catatan" value={catatan} onChange={e => changeHandlerCatatan(e)} /> */}
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
                                {/* <label htmlFor="floatingInputCatatan">Catatan Tidak Diterima</label> */}
                            </div>
                            <div className="mt-3">
                                <ToastContainer />
                                <button type="submit" disabled={buttonStatus} style={{display: validateVisibility}} className="btn btn-outline-success"><HiSaveAs size={20}/> Simpan</button>
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
                    Filter RL 3.4
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
                            <div
                            className="form-floating"
                            style={{ width: "100%", display: "inline-block" }}
                            >
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
                sheet="data RL 34"
                currentTableRef={tableRef.current}
            >
                {/* <button> Export excel </button> */}
                <button className="btn btn-outline-success mb-2">
                        <HiSaveAs /> Export Excel
                </button>
            </DownloadTableExcel>
            <Table
                className={style.rlTable}
                striped
                bordered
                responsive
                style={{ width: "200%" }}
                ref={tableRef}
            >
                <thead>
                <tr>
                    <th
                    style={{ width: "2%", textAlign: "center", verticalAlign: "middle"}}
                    >
                    No.
                    </th>
                    <th style={{ width: "3%", textAlign: "center", verticalAlign: "middle"}}>RL</th>
                    <th style={{"width": "10%"}}>Nama RS</th>
                    <th style={{ width: "3%", textAlign: "center", verticalAlign: "middle"}}>Tahun</th>
                    <th style={{ width: "7%", textAlign: "center", verticalAlign: "middle"}}>Kab/Kota</th>
                    <th style={{"width": "15%"}}>Jenis Kegiatan</th>
                    <th style={{"width": "5%"}}>RM Rumah Sakit</th>
                    <th style={{"width": "5%"}}>RM Bidan</th>
                    <th style={{"width": "5%"}}>RM Puskesmas</th>
                    <th style={{"width": "5%"}}>RM Faskes Lainnya</th>
                    <th style={{"width": "5%"}}>RM Hidup</th>
                    <th style={{"width": "5%"}}>RM Mati</th>
                    <th style={{"width": "5%"}}>RM Total</th>
                    <th style={{"width": "5%"}}>RNM Hidup</th>
                    <th style={{"width": "5%"}}>RNM Mati</th>
                    <th style={{"width": "5%"}}>RNM Total</th>
                    <th style={{"width": "5%"}}>NR Hidup</th>
                    <th style={{"width": "5%"}}>NR Mati</th>
                    <th style={{"width": "5%"}}>NR Total</th>
                    <th style={{"width": "5%"}}>Dirujuk</th>
                </tr>
                </thead>
                <tbody>
                    {dataRL.map((value, index) => {
                        return (
                            <tr key={value.id}>
                                <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                                    <label htmlFor="">{index + 1}</label>
                                </td>
                                <td>RL 3.4 </td>
                                <td>{namaRS}</td>
                                <td>{namaTahun}</td>
                                <td>{namakabkotaView}</td>
                                <td>
                                    <label htmlFor="">{value.jenis_kegiatan.nama}</label>
                                </td>
                                <td>
                                    <label htmlFor="">{value.rmRumahSakit}</label>
                                </td>
                                <td>
                                    <label htmlFor="">{value.rmBidan}</label>
                                </td>
                                <td>
                                    <label htmlFor="">{value.rmPuskesmas}</label>
                                </td>
                                <td>
                                    <label htmlFor="">{value.rmFaskesLainnya}</label>
                                </td>
                                <td>
                                    <label htmlFor="">{value.rmHidup}</label>
                                </td>
                                <td>
                                    <label htmlFor="">{value.rmMati}</label>
                                </td>
                                <td>
                                    <label htmlFor="">{value.rmTotal}</label>
                                </td>
                                <td>
                                    <label htmlFor="">{value.rnmHidup}</label>
                                </td>
                                <td>
                                    <label htmlFor="">{value.rnmMati}</label>
                                </td>
                                <td>
                                    <label htmlFor="">{value.rnmTotal}</label>
                                </td>
                                <td>
                                    <label htmlFor="">{value.nrHidup}</label>
                                </td>
                                <td>
                                    <label htmlFor="">{value.nrMati}</label>
                                </td>
                                <td>
                                    <label htmlFor="">{value.nrTotal}</label>
                                </td>
                                <td>
                                    <label htmlFor="">{value.dirujuk}</label>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </Table>
            </div>
        </div>
        </div>
    );
};

export default RL34;
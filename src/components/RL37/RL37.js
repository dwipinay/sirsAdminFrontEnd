import React, { useState, useEffect, useRef } from "react";
import axios from 'axios'
import jwt_decode from 'jwt-decode'
import { useNavigate } from 'react-router-dom'
import style from './FormTambahRL37.module.css'
import { HiSaveAs } from 'react-icons/hi'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import 'react-confirm-alert/src/react-confirm-alert.css'
import Spinner from 'react-bootstrap/Spinner';
import { DownloadTableExcel } from "react-export-table-to-excel";
import Select from 'react-select'
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";

export const RL37 = () => {
    const [tahun, setTahun] = useState(new Date().getFullYear() - 1)
    const [namaTahun, setNamaTahun] = useState(new Date().getFullYear() - 1);
    const [namaRS, setNamaRS] = useState('')

    const [token, setToken] = useState('')
    const [expire, setExpire] = useState('')
    const [dataRL, setDataRL] = useState([]);
    const [spinner, setSpinner] = useState(false)
    const navigate = useNavigate()
    const [options, setOptions] = useState([]);
    const [optionsrs, setOptionsRS] = useState([]);
    const [idkabkota, setIdKabKota] = useState("");
    const [idrs, setIdRS] = useState("");
    const tableRef = useRef(null);
    const [namafile, setNamaFile] = useState("");
    const [namakabkota, setKabKota] = useState("");
    const [namakabkotaView, setKabKotaView] = useState("");
    const [statusValidasi, setStatusValidasi] = useState({ value: 3, label: 'Belum divalidasi' })
    const [statusValidasiId, setStatusValidasiId] = useState(3)
    const [optionStatusValidasi, setOptionStatusValidasi] = useState([])
    const [catatan, setCatatan] = useState(" ")
    const [buttonStatus, setButtonStatus] = useState(true)
    const [statusDataValidasi, setStatusDataValidasi] = useState()
    const [validateAccess, setValidateAccess] = useState(true)
    const [validateVisibility, setValidateVisibility] = useState("none")
    const [kategoriUser, setKategoriUser] = useState(3)
    const [Buttonsearch, setButtonsearch] = useState(true);


    useEffect(() => {
        refreshToken()
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
            setKabKota(e.target.options[e.target.selectedIndex].text);
        } catch (error) {
            if (error.response) {
                console.log(error);
            }
        }
    };

    const changeHandlerSingle = (event) => {
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
        if (kategoriUser === 2) {
            setValidateAccess(true)
            setValidateVisibility("none")
        } else if (kategoriUser === 3) {
            setValidateAccess(false)
            setValidateVisibility("block")
        }
        console.log(validateAccess)
    }

    const Validasi = async (e) => {
        e.preventDefault();
        setSpinner(true);
        let date = (tahun + '-01-01');

        // getDataStatusValidasi()

        if (statusValidasiId === 3) {
            alert('Silahkan pilih status validasi terlebih dahulu')
            setSpinner(false)
        } else {
            if (statusValidasiId === 2 && catatan === "") {
                alert('Silahkan isi catatan apabila laporan tidak valid')
                setSpinner(false)
            } else if (idrs === "") {
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
                            rlid: 7,
                            tahun: date,
                        },
                    };
                    const results = await axiosJWT.get(
                        "/apisirs/validasi",
                        customConfig
                    )

                    if (results.data.data == null) {

                    } else {
                        setStatusDataValidasi(results.data.data.id)
                    }
                } catch (error) {
                    console.log(error);
                }

                if (statusDataValidasi == null) {
                    try {
                        const customConfig = {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            }
                        }
                        await axiosJWT.post('/apisirs/validasi', {
                            rsId: idrs,
                            rlId: 7,
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
    }

    const getDataStatusValidasi = async () => {
        // e.preventDefault();
        let date = (tahun + '-01-01');

        try {
            const customConfig = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    rsid: idrs,
                    rlid: 7,
                    tahun: date,
                },
            };
            const results = await axiosJWT.get(
                "/apisirs/validasi",
                customConfig
            )

            if (results.data.data == null) {
                setButtonStatus(false)
                // setStatusDataValidasi()
                setStatusValidasi({ value: 3, label: 'Belum divalidasi' })
                setCatatan(' ')
            } else {
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
        e.preventDefault()
        setSpinner(true)
        changeValidateAccess()
        if (idrs !== "") {
            try {
                const customConfig = {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        koders: idrs,
                        tahun: tahun,
                        option: options,
                    },

                }
                const results = await axiosJWT.get('/apisirs/rltigatitiktujuhadmin',
                    customConfig)


                const rlTigaTitikTujuhDetails = results.data.data.map((value) => {
                    return value.rl_tiga_titik_tujuh_details
                })

                let dataRLTigaTitikTujuhDetails = []
                rlTigaTitikTujuhDetails.forEach(element => {
                    element.forEach(value => {
                        dataRLTigaTitikTujuhDetails.push(value)
                    })
                })
                let sortedProducts = dataRLTigaTitikTujuhDetails.sort((p1, p2) =>
                    p1.jenis_kegiatan_id > p2.jenis_kegiatan_id
                        ? 1
                        : p1.jenis_kegiatan_id < p2.jenis_kegiatan_id
                            ? -1
                            : 0
                );

                let groups = [];
                sortedProducts.reduce(function (res, value) {
                    if (!res[value.jenis_kegiatan.group_jenis_kegiatan_id]) {
                        res[value.jenis_kegiatan.group_jenis_kegiatan_id] = {
                            groupId: value.jenis_kegiatan.group_jenis_kegiatan_id,
                            groupNama:
                                value.jenis_kegiatan.group_jenis_kegiatan_header.nama,
                            groupNo:
                                value.jenis_kegiatan.group_jenis_kegiatan_header.no,
                            jumlah: 0,
                        };
                        groups.push(
                            res[value.jenis_kegiatan.group_jenis_kegiatan_id]
                        );
                    }
                    res[value.jenis_kegiatan.group_jenis_kegiatan_id].jumlah +=
                        value.jumlah;
                    return res;
                }, {});

                let data = [];
                groups.forEach((element) => {
                    if (element.groupId != null) {
                        const filterData = sortedProducts.filter((value, index) => {
                            return (
                                value.jenis_kegiatan.group_jenis_kegiatan_id ===
                                element.groupId
                            );
                        });
                        data.push({
                            groupNo: element.groupId,
                            groupNama: element.groupNama,
                            groupNomor: element.groupNo,
                            details: filterData,
                            subTotal: element.jumlah,
                        });
                    }
                });
                if (!results.data.data.length) {
                    changeValidateAccessEmpty()
                }
                setDataRL(data);
                setNamaFile("RL37_" + idrs);
                setSpinner(false)
                setNamaRS(results.data.dataRS.RUMAH_SAKIT);
                changeNamaTahun()
                changeNamaKota()
                // getDataValidasi();
            } catch (error) {
                toast("Get Data Error", {
                    position: toast.POSITION.TOP_RIGHT,
                });
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
                            <h5 className="card-title h5">Validasi RL 3.7</h5>
                            <form onSubmit={Validasi}>
                                {/* <div className="form-floating" style={{width:"100%", display:"inline-block"}}> */}
                                <Select
                                    options={optionStatusValidasi} className="form-control" name="status_validasi_id" id="status_validasi_id"
                                    onChange={changeHandlerStatusValidasi} value={statusValidasi} isDisabled={validateAccess}
                                />
                                {/* <label htmlFor="status_validasi_id">Status Validasi</label> */}
                                {/* </div> */}
                                <div className="form-floating" style={{ width: "100%", display: "inline-block" }}>
                                    {/* <input rows={10} cols={5} name="catatan" type="textarea" className="form-control" id="floatingInputCatatan" disabled={validateAccess}
                                    placeholder="catatan" value={catatan} onChange={e => changeHandlerCatatan(e)} />
                                <label htmlFor="floatingInputCatatan">Catatan Tidak Diterima</label> */}
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
                                    Filter RL 3.7
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
                        sheet="data RL 37"
                        currentTableRef={tableRef.current}
                    >
                        <button className="btn btn-outline-success mb-2">
                            <HiSaveAs /> Export Excel
                        </button>
                    </DownloadTableExcel>
                    <table className={style.rlTable} ref={tableRef}>

                        <thead>
                            <tr>
                                <th style={{ "width": "6%" }}>No</th>
                                <th>RL</th>
                                <th>Nama RS</th>
                                <th>Tahun</th>
                                <th>Kab/Kota</th>

                                {/* <th style={{"width": "10%"}}> </th> */}
                                {/* <th style={{"width": "7%"}}>No Kegiatan</th> */}
                                <th>Jenis Kegiatan</th>
                                <th>Jumlah</th>
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

                                                    <td>{value.groupNomor}</td>
                                                    <td> </td>
                                                    <td> </td>
                                                    <td> </td>
                                                    <td> </td>
                                                    {/* <td></td> */}
                                                    <td style={{ textAlign: "left" }}>
                                                        {value.groupNama}
                                                    </td>
                                                    <td>{value.subTotal}</td>
                                                </tr>
                                                {value.details.map((value2, index2) => {
                                                    return (
                                                        <tr key={index2}>
                                                            <td>{value2.jenis_kegiatan.no}</td>
                                                            <td>RL 3.7 </td>
                                                            <td>{namaRS}</td>
                                                            <td>{value2.tahun}</td>
                                                            <td>{namakabkotaView}</td>

                                                            {/* <td>
                                <ToastContainer />
                                
                                <Link to={`/rl37/ubah/${value2.id}`}>
                                  <RiEdit2Fill
                                    size={20}
                                    style={{ color: "gray", cursor: "pointer" }}
                                  />
                                </Link>
                              </td> */}
                                                            <td style={{ textAlign: "left" }}>
                                                                &emsp;{value2.jenis_kegiatan.nama}
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
                    </table>
                </div>
            </div>
        </div>
    )
}

export default RL37
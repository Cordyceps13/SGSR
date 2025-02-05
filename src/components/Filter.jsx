import '../css/Filter.modules.css'
import { useState } from 'react';

const Filter = () => {
    const [isFilterOpen, setisFilterOpen] = useState(false);

    const toggleFilter = () => {
        setisFilterOpen(!isFilterOpen);
    }


    return (
        <>
            <div className="filter-container">
                <div className="filter">
                    <p>Filtrar</p>
                    <svg onClick={toggleFilter} xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24" width="36" height="36">
                        <path d="M6.41,9H17.59a1,1,0,0,1,.7,1.71l-5.58,5.58a1,1,0,0,1-1.42,0L5.71,10.71A1,1,0,0,1,6.41,9Z" />
                    </svg>
                </div>
                {isFilterOpen && <>
                    <hr />
                    <div className="filter-options">
                        <p><input type="radio" name="Ativas" id="Ativas" />&nbsp;&nbsp;&nbsp;Ativas</p>
                        <p><input type="radio" name="Confirmadas" id="Confirmadas" />&nbsp;&nbsp;&nbsp;Confirmadas</p>
                        <p><input type="radio" name="Pendentes" id="Pendentes" />&nbsp;&nbsp;&nbsp;Pendentes</p>
                        <p><input type="radio" name="Canceladas" id="Canceladas" />&nbsp;&nbsp;&nbsp;Canceladas</p>
                        <p><input type="radio" name="Terminadas" id="Terminadas" />&nbsp;&nbsp;&nbsp;Terminadas</p>
                        <p><input type="radio" name="Todas" id="Todas" />&nbsp;&nbsp;&nbsp;Todas</p>
                    </div></>}
            </div>
        </>
    )
}

export default Filter;
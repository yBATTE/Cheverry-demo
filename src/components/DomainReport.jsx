import React, { useState, useRef, useEffect } from "react";
const zones = [
  {id:"vehicle",number:1,title:"Que coincida con el vehículo",text:"Compará dominio (patente), marca, modelo, año, número de motor y número de chasis con el auto que estás por comprar."},
  {id:"holder",number:2,title:"Datos del actual titular",text:"Acá figura quién es el titular. Compará estos datos con los del vendedor: tener el auto no significa ser su dueño."},
  {id:"warnings",number:3,title:"Dónde pueden aparecer problemas",text:"Revisá inhibiciones, prenda, denuncias, medidas judiciales, afectaciones y trámites pendientes. En este ejemplo, los campos indican «NO POSEE»."}
];
export default function DomainReport() {
  const [expanded,setExpanded] = useState(false);
  const dialog = useRef(null);
  useEffect(()=>{if(expanded && dialog.current && !dialog.current.open) dialog.current.showModal();},[expanded]);
  return <div className="domain-example">
    <div className="domain-example-heading"><span className="eyebrow">EJEMPLO DE LECTURA</span><h3>Ubicá cada dato en el informe.</h3><p>Las zonas marcadas corresponden a los puntos que tenés que revisar.</p></div>
    <div className="domain-example-grid">
      <figure className="domain-figure">
        <div className="domain-document">
          <img src="/assets/informe-dominio-ejemplo.png" alt="Ejemplo de informe de estado de dominio: vehículo en la parte superior, titular debajo y alertas registrales en la parte inferior." width="700" height="1675" />
          {zones.map(z=><div className={`domain-zone domain-zone-${z.id}`} key={z.id} aria-hidden="true"><span>{z.number}</span></div>)}
          <div className="domain-zone domain-zone-pending" aria-hidden="true" />
        </div>
        <figcaption>Informe de ejemplo proporcionado para el curso.</figcaption>
        <button className="outline full" onClick={()=>setExpanded(true)}>Ampliar informe marcado ↗</button>
      </figure>
      <div className="domain-legend">{zones.map(z=><div className={`domain-legend-card domain-legend-${z.id}`} key={z.id}><span className="domain-number">{z.number}</span><div><h4>{z.title}</h4><p>{z.text}</p></div></div>)}</div>
    </div>
    {expanded && <dialog ref={dialog} onCancel={()=>setExpanded(false)} className="domain-dialog" aria-label="Informe de dominio ampliado"><div className="domain-dialog-bar"><strong>Informe de dominio · Zonas de revisión</strong><button className="outline" autoFocus onClick={()=>setExpanded(false)}>Cerrar ×</button></div><div className="domain-dialog-scroll"><div className="domain-document"><img src="/assets/informe-dominio-ejemplo.png" alt="Informe de dominio ampliado con las tres zonas marcadas" width="700" height="1675"/>{zones.map(z=><div className={`domain-zone domain-zone-${z.id}`} key={z.id} aria-hidden="true"><span>{z.number}</span></div>)}<div className="domain-zone domain-zone-pending" aria-hidden="true" /></div></div></dialog>}
  </div>;
}

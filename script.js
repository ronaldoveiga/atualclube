class POWERCRM{
  pwrst = 'https://app.powercrm.com.br';
  //pwrst = 'https://localhost:8443';

  pwrcrmform = document.querySelector('#pwrcrmform');

  //fields
  fieldName = document.querySelector('#pwrClntNm'); 
  fieldEmail = document.querySelector('#pwrClntMl'); 
  fieldPhone = document.querySelector('#pwrCltPhn'); 

  fieldCity = document.querySelector('#pwrCt'); 
  fieldState = document.querySelector('#pwrStt'); 

  fieldPlate = document.querySelector('#pwrVhclPlt'); 
  fieldVehicleType = document.querySelector('#pwrVhclTyp'); 
  fieldVehicleBranch = document.querySelector('#pwrVhclBrnch'); 
  fieldVehicleModel = document.querySelector('#pwrVhclMdl'); 
  fieldVehicleYear = document.querySelector('#pwrVhclYr');

  fieldVehicleIsWork = document.querySelector('#pwrVhclSWrk'); 
  
  constructor(){

    
    // event field States
    if(this.fieldPhone){
      this.fieldPhone.addEventListener('blur',  event => {
        this.maskPhone(this.fieldPhone);
      });
    }

    // event field States
    if(this.fieldState){
      this.fetchStates();
      this.fieldState.addEventListener('change',  event => {
        let stateId = this.fieldState.value;
        if(stateId && stateId > 0) this.fetchCities(stateId);
      });
    }

    // event field vehicles
    if(this.fieldVehicleType){

      //vehicle type
      this.fieldVehicleType.addEventListener('change',  event => {
        let type = this.fieldVehicleType.value;
        if(type && type > 0) this.fetchBrands(type);
      });

      //vehicle branch
      this.fieldVehicleBranch.addEventListener('change',  event => {
        let branchId = this.fieldVehicleBranch.value;
        if(branchId && branchId > 0) this.fetchYears(branchId);
      });

      //vehicle models year
      this.fieldVehicleYear.addEventListener('change',  event => {
        let year = this.fieldVehicleYear.value;
        let branchId = this.fieldVehicleBranch.value;
        if((year && year > 0) && (branchId && branchId > 0)) this.fetchModels(branchId, year);
      });

    }
    
    // event submit
    pwrcrmform.addEventListener('submit',  event => {
      event.preventDefault();
      this.saveForm();
    });

  }

  maskPhone = (phone) =>{
    let phoneValue = phone.value.replace(/[^0-9]/g,'');
	
	if(phoneValue>= 11) phoneValue = phoneValue.slice(0,11);
    
    let phoneMask = '';
    if(phoneValue.length === 11) {
      const p1 = phoneValue.slice(0,2);
      const p2 = phoneValue.slice(2,7);
      const p3 = phoneValue.slice(7,11);
      phoneMask = `(${p1}) ${p2}-${p3}` 
    } else if(phoneValue.length === 10) {
      const p1 = phoneValue.slice(0,2);
      const p2 = phoneValue.slice(2,6);
      const p3 = phoneValue.slice(6,10);
      phoneMask = `(${p1}) ${p2}-${p3}` 
    }
    phone.value = phoneMask;
  }

  validadeFieldRequired = () => {
    console.log(pwrcrmform);
  }

  saveForm = async function(){
    let pwrcrmdata = {};

    if(!document.querySelector('#pwrCmpnHsh') || !document.querySelector('#pwrFrmCode')){
      alert('O formato do formulário não está correto!')
      return false;
    }

    this.validadeFieldRequired();

    //fields hides
    if(this.getValue('#pwrCmpnHsh')) pwrcrmdata.companyHash = this.getValue('#pwrCmpnHsh');
    if(this.getValue('#pwrFrmCode')) pwrcrmdata.formCode = this.getValue('#pwrFrmCode');
    if(this.getValue('#pwrLdSrc')) pwrcrmdata.leadSource = this.getValue('#pwrLdSrc');
    if(this.getValue('#pwrPplnClmn')) pwrcrmdata.pipelineColumn = this.getValue('#pwrPplnClmn');
	if(this.getValue('#pwrCnsltnt')) pwrcrmdata.companyUserCode = this.getValue('#pwrCnsltnt');
    if(this.getValue('#pwrAfflt')) pwrcrmdata.affiliateCode = this.getValue('#pwrAfflt');
    

    //client
    if(this.fieldName) pwrcrmdata.clientName = this.fieldName.value;
    if(this.fieldEmail){
      if(!this.validateEmail(this.fieldEmail.value)){
        alert('E-mail invalido!')
        return false;
      }
      pwrcrmdata.clientEmail = this.fieldEmail.value;
    } 
    
    if(this.fieldPhone) pwrcrmdata.clientPhone = this.fieldPhone.value;

    if(this.fieldCity) pwrcrmdata.clientCity = this.fieldCity.value;
    //if(this.fieldState) pwrcrmdata.clientState = this.fieldState.value;

    //vehicle
    if(this.fieldPlate) pwrcrmdata.vehiclePlate = this.fieldPlate.value;
    if(this.fieldVehicleType) pwrcrmdata.vehicleType = this.fieldVehicleType.value;
    if(this.fieldVehicleBranch) pwrcrmdata.vehicleBranch = this.fieldVehicleBranch.value;
    if(this.fieldVehicleModel) pwrcrmdata.vehicleModel = this.fieldVehicleModel.value;
    if(this.fieldVehicleYear) pwrcrmdata.vehicleYear = this.fieldVehicleYear.value;
    if(this.fieldVehicleIsWork) pwrcrmdata.vehicleIsWork = this.fieldVehicleIsWork.checked;
	
	
	
  
    const response =  await this.fetchApi(`${this.pwrst}/svQttnDynmcFrm`, {
      method: 'POST',
      body: JSON.stringify(pwrcrmdata),
      headers: { 'Content-Type': 'application/json'}
    });
    
    if(response.success){
      if(response.redirecTo!=null && response.redirecTo.length > 0){
        window.location = response.redirecTo;
      }else if(response.isPlan > 0){
        if (response.isPlan==1) window.location = this.pwrst+'/compareTables?h='+response.qttnCd;
        else  window.location = this.pwrst+'/receivedQuotation?h='+response.qttnCd;
      } else window.location = this.pwrst+'/noPlan?h='+response.qttnCd;
    }else alert(response.message);

  }

  async fetchBrands(type) {
    this.fieldVehicleBranch.innerHTML = '<option value="0">Buscando marcas..</option>';
    const response =  await this.fetchApi(`${this.pwrst}/cb/?${new URLSearchParams({type})}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json'}
    });
    if(response) this.constructSelect(this.fieldVehicleBranch, response);    
  }

  async fetchYears(branchId) {
    this.fieldVehicleYear.innerHTML = '<option value="0">Buscando anos..</option>';
    const response =  await this.fetchApi(`${this.pwrst}/bmy/?${new URLSearchParams({cb : branchId})}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json'}
    });
    if(response) this.constructSelect(this.fieldVehicleYear, response);    
  }
  
  async fetchModels(branchId, year) {
    this.fieldVehicleModel.innerHTML = '<option value="0">Buscando modelos..</option>';
    const response =  await this.fetchApi(`${this.pwrst}/cmby/?${new URLSearchParams({cb: branchId, cy : year})}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json'}
    });
    if(response) this.constructSelect(this.fieldVehicleModel, response);    
  }
  
  async fetchStates(){
    this.fieldState.innerHTML = '<option value="0">Buscando estados..</option>';
    const response =  await this.fetchApi(`${this.pwrst}/stt`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json'}
    });
    if(response) this.constructSelect(this.fieldState, response);    
  }

  async fetchCities(stateId){
    this.fieldCity.innerHTML = '<option value="0">Buscando cidades..</option>';
    const response =  await this.fetchApi(`${this.pwrst}/ct/?${new URLSearchParams({'st': stateId})}`, {
      method: 'GET',
      // body: JSON.stringify({st: stateId}),
      headers: { 'Content-Type': 'application/json'}
    });
    if(response) this.constructSelect(this.fieldCity, response);    
  }
  
  
  // funcões globais
  async fetchApi(url, option){
    return await fetch(url, option).catch(er => console.error(er.message)).then(response => response.json())
  }

  constructSelect(select, arr){
    select. innerHTML = '<option val="0">Selecione</option>';

    arr.map(a => {
      let option = document.createElement("option");
      option.value = a.id;
      option.innerHTML = a.text;

      select.appendChild(option);

    })
  }

  validateEmail(email) {
    var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
      return re.test(String(email).toLowerCase());
  }

  getValue = (field) => document.querySelector(field) && document.querySelector(field).value;
  


}
new POWERCRM;
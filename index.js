"use strict";

const FIO_REGEXP = /^([A-zА-я]+\s){2}[A-zА-я]+$/;
const EMAIL_REGEXP = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/;
const PHONE_REGEXP = /^\+7\(\d{3}\)\d{3,3}-\d{2}-\d{2}$/;
const ALLOWED_EMAIL_DOMAINS = ['@ya.ru', '@yandex.ru', '@yandex.ua', '@yandex.by', '@yandex.kz', '@yandex.com'];

const myFormDomNode = document.querySelector('#myForm');
const submitDomNode = myFormDomNode.querySelector('#submitButton');
const resultDomNode = myFormDomNode.querySelector('#resultContainer');

const myFormFields = [
    {
        name: 'fio',
        domNode: myFormDomNode.querySelector('input[name=fio]'),
        validate: (value) => FIO_REGEXP.test(value)
    },
    {
        name: 'email',
        domNode: myFormDomNode.querySelector('input[name=email]'),
        validate: (value) => {
            const email = value.toString();
            const emailEndsWithAllowedEmailDomain = ALLOWED_EMAIL_DOMAINS.find((domain) => email.endsWith(domain));
            return emailEndsWithAllowedEmailDomain && EMAIL_REGEXP.test(email);
        }
    },
    {
        name: 'phone',
        mask: '+9(999)999-99-99',
        domNode: myFormDomNode.querySelector('input[name=phone]'),
        validate: (value) => {
            const phone = value.toString();
            const phoneDigitsSum = phone
                .split('')
                .map(x => parseInt(x, 10) || 0)
                .reduce((accumulator, value) => accumulator + value, 0);
            return phoneDigitsSum <= 30 && PHONE_REGEXP.test(phone);
        }
    }
];

window.myForm = {
    validate() {
        const data = this.getData();

        const errorFieldNames = myFormFields
            .filter(field => !field.validate(data[field.name]))
            .map(fieldWithError => fieldWithError.name);

        myFormFields.forEach(field => {
           if(errorFieldNames.includes(field.name)) {
               field.domNode.classList.add('error');
           } else {
               field.domNode.classList.remove('error');
           }
        });

        return {
            errorFields: errorFieldNames,
            isValid: errorFieldNames.length === 0
        };
    },
    getData() {
        return myFormFields.reduce((data, field) =>
            Object.assign(data, {[field.name]: field.domNode.value}),
            {}
        );
    },
    setData(newData) {
        myFormFields.forEach(field => {
            if(newData[field.name] === undefined) return;
            field.domNode.value = newData[field.name];
        });
    },
    submit() {
        const {isValid} = this.validate();
        if(!isValid) return;

        resultDomNode.value = '';
        submitDomNode.disabled = true;

        const body = new FormData();
        const formData = myForm.getData();
        Object.keys(formData).forEach(key => body.append(key, formData[key]));

        fetch(myFormDomNode.action, {body, method: 'POST'})
            .then(res => res.json())
            .then(response => {
                switch(response.status) {
                    case 'success':
                        resultDomNode.classList = ['success'];
                        resultDomNode.innerHTML = 'Success';
                        break;
                    case 'error':
                        resultDomNode.classList = ['error'];
                        resultDomNode.innerHTML = response.reason;
                        break;
                    case 'progress':
                        resultDomNode.classList = ['progress'];
                        resultDomNode.innerHTML = 'Waiting';
                        setTimeout(() => this.submit(), response.timeout);
                        return;
                }

                submitDomNode.disabled = false;
            })
            .catch(error => {
                resultDomNode.classList = ['error'];
                resultDomNode.innerHTML = error.toString();
                submitDomNode.disabled = false;
            })
    }
};

myFormFields
    .filter(field => field.mask)
    .forEach(fieldWithMask => VMasker(fieldWithMask.domNode).maskPattern(fieldWithMask.mask));

myFormDomNode.onsubmit = function(event) {
    event.preventDefault();
    myForm.submit();
    return false;
};
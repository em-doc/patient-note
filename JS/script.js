// Initialize Vue app
const { createApp } = Vue
createApp({
    data() {
        return {
            hpiData: {
                age: 23,
                gender: 'male',
                pmh: [],
                pmhOther: '',
                problem: [],
                problemOther: '',
                duration: 2,
                durationUnit: 'Days',
                hpiOther: '',
            },
            pmhOptions: {
                Asthma: 'Asthma',
                AFib: 'Atrial Fibrillation',
                CAD: 'Coronary Artery Disease',
                CHF: 'Congestive Heart Failure',
                CKD: 'Chronic Kidney Disease',
                COPD: 'Chronic Obstructive Pulmonary Disease',
                CVA: 'Previous Cerebrovascular Accident',
                DM: 'Diabetes',
                ESRD: 'End Stage Renal Disease',
                GERD: 'Gastroesophageal Reflux Disease',
                HbSS: 'Sickle Cell Disease',
                Hypothyroid: 'Hypothyroidism',
                HLD: 'Dyslipidemia',
                HTN: 'Hypertension',
                OA: 'Osteoarthritis',
                OSA: 'Obstructive Sleep Apnea',
                RA: 'Rheumatoid Arthritis',
            },
            problems: [
                'Abdominal Pain',
                'Chest Pain',
                'Diarrhea',
                'Dizziness',
                'Dysuria',
                'Fever',
                'Headache',
                'Nausea',
                'Shortness of Breath',
                'Vaginal Bleeding',
                'Vomiting',
            ],
            durations: [
                'Minutes',
                'Hours',
                'Days',
                'Weeks',
                'Months',
                'Years',
            ],
            physicalExam: {
                General: 'alert and oriented to person, time, place',
                Psych: 'mood appropriate for situation',
                Head: 'normocephalic; atraumatic',
                ENT: 'patent nares; no nasal flaring',
                Pulm: 'equal breath sounds bilaterally; no wheezes, rales, or rhonchi',
                Cardio: 'normal s1, s2; no murmurs, rubs, or gallops',
                Abdomen: 'soft, nontender, nondistended',
                Neuro: 'normal sensation and movement',
                MSK: 'no gross deformities noted',
                'Lymph/Vasc': 'no lower extremity edema; pulses equal bilaterally',
            },
            chiefComplaint: '',  // Selected chief complaint
            complaints: [
                'Abdominal Pain (CT)',
                'Abdominal Pain (No CT)',
                'Chest Pain',
                'Code Stroke',
                'Shortness of Breath',
                'Vaginal Bleeding (Pregnant)',
                'Vaginal Bleeding (Not Pregnant)',
            ],
            mdmTemplates: {
                'Abdominal Pain (CT)': 'The patient presents with abdominal pain. Physical exam reveals a tender abdomen concerning for a possible surgical process. Patient will require a CT scan of their abdomen/pelvis. They will be re-assessed as indicated. Their pain will be treated with medication.',
                'Abdominal Pain (No CT)': "The patient presents with abdominal pain. Physical exam reveals a soft abdomen without evidence of peritonitis. Patient does not currently require a CT scan. They will be re-assessed as indicated. Their pain will be treated with medication.",
                'Chest Pain': "The patient presents with chest pain. Their risk factors and relevant historical elements are factored into a risk assessment for acute coronary syndrome. EKG will be reviewed and documented. Will check cardiac enzymes, chest xray, other relevant labwork. Will continue to monitor patient with repeat EKG to be obtained for evolving symptoms if needed.",
                'Code Stroke': "The patient presents with an acute neurologic deficit. Code stroke called from triage. Neurology currently assessing patient, pending their recommendations. Patient to undergo CT scans of head and neck. Will continue to closely monitor patient, interventions may include tenecteplase or thrombectomy dependent on findings.",
                'Shortness of Breath': "The patient is presenting with respiratory difficulty. Initial vital signs do not demonstrate hypoxia. A chest x-ray is ordered to evaluate for a pleural effusion, pneumothorax, or focal consolidation. The patient's history and exam were factored into a PERC and/or Wells Score. They do not require a CT angiogram of the chest at this time to exclude a pulmonary embolism. We will continue to monitor their vitals on pulse oximetry as clinically indicated.",
                'Vaginal Bleeding (Pregnant)': "A speculum exam reveals that the patient is actively bleeding with a closed cervical os. Until further results are received, this may be a threatened pregnancy loss. We will obtain a comprehensive metabolic panel, a complete blood count, a quantitative HCG, a type and screen for any needed blood transfusions as well as to determine need for RhoGAM administration, a urinalysis and urine culture to assess for infectious trigger for bleeding, and a transvaginal ultrasound to confirm location of pregnancy and assess fetal health.",
                'Vaginal Bleeding (Not Pregnant)': "A speculum exam reveals that patient is currently bleeding with a closed cervical os. At least one hemoglobin will be measured as part of a complete blood count to assess the degree of blood loss. The patient will need to follow up with a gynecologist to explore non-emergent causes of bleeding.",
            },
            mdm: '',
            generatedNote: '',
            notesArray: JSON.parse(localStorage.getItem('savedNotes')) || [],
            visibleNoteIndex: null
        };
    },
    watch: {
        chiefComplaint(newComplaint) {
            this.mdm = this.mdmTemplates[newComplaint] || ''; // Default to empty if no template found
        },
        notesArray: {
            handler(newValue) {
                localStorage.setItem('savedNotes', JSON.stringify(newValue));
            },
            deep: true // Watch for changes inside the array too
        }
    },
    computed: {
        patientPronoun() {
            return this.getPronoun(this.hpiData.gender); // Call the helper method
        }
    },
    methods: {
        generateNote() {
            // Take out upper case letters
            const lowerCasePMH = this.hpiData.pmh.map(item => item.toLowerCase());
            const lowerCaseProblem = this.hpiData.problem.map(item => item.toLowerCase());
            const lowercaseDuration = this.hpiData.durationUnit.toLowerCase();

            // Determine PMH text 
            const pmhText = (lowerCasePMH.length || this.hpiData.pmhOther)
                ? `${lowerCasePMH.join(', ')}${this.hpiData.pmhOther ? (lowerCasePMH.length ? ', ' : '') + this.hpiData.pmhOther : ''}` // Conditional for comma placement
                : 'no past medical history';

            const problemText = (lowerCaseProblem.length || this.hpiData.problemOther)
                ? `${lowerCaseProblem.join(', ')}${this.hpiData.problemOther ? (lowerCaseProblem.length ? ', ' : '') + this.hpiData.problemOther : ''}`
                : 'no complaint';

            // Synthesize an HPI statement
            const hpiText = `${this.hpiData.age}-year-old ${this.hpiData.gender} with ${pmhText} presents with ${problemText} for the past ${this.hpiData.duration} ${lowercaseDuration}. ${this.hpiData.hpiOther}`;

            // Synthesize a physical exam statement
            const physicalExamText = Object.entries(this.physicalExam).map(([system, findings]) => `${system}: ${findings}`).join('\n');

            // Synthesize the full output
            this.generatedNote = `${hpiText}\n\n${physicalExamText}\n\n${this.mdm}`;
        },
        downloadNote() {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const filename = `note_${hours}${minutes}.txt`;

            const blob = new Blob([this.generatedNote], { type: "text/plain;charset=utf-8" });
            saveAs(blob, filename);
        },
        saveToArray() {
            // Push the new note object into the notesArray
            this.notesArray.push(this.generatedNote);

            console.log('Info pushed to an array')
            this.notesArray.forEach(note => {
                console.log(note);
            })
        },
        showNote(index) {
            this.visibleNoteIndex = (this.visibleNoteIndex === index) ? null : index;
        }
    },
}).mount('#app')

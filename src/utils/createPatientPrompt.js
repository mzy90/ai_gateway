/**
 * 创建患者信息提示字符串（中文版）
 * @param {Object} patient - 患者信息对象
 * @returns {string} 格式化后的患者信息字符串
 */
export default function createPatientPrompt(patient) {
    // 性别
    let sexText = '未知';
    if (patient.sex == 1) {
        sexText = '男';
    } else if (patient.sex == 2) {
        sexText = '女';
    }

    // 慢性病
    let chronic = '无';
    if (patient.chronic_diseases && 
        Array.isArray(patient.chronic_diseases) && 
        patient.chronic_diseases.length > 0) {
        chronic = patient.chronic_diseases.join('，');
    }

    // 其他慢性病
    let other = patient.other_chronic_diseases || '无';
    const name = patient.patient_name || '';
    const birthday = patient.birthday || '';

    return `下面是就诊人员信息：
姓名：${name}
出生日期：${birthday}
性别：${sexText}
慢性病：${chronic}
其他慢性病：${other}
`;
}
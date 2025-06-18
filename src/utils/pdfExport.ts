import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { MCQ } from '../context/MCQContext';

export const exportToPDF = async (mcqs: MCQ[], includeAnswers: boolean = false) => {
  try {
    // Create a temporary container for the content
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '800px';
    container.style.backgroundColor = 'white';
    container.style.padding = '40px';
    container.style.fontFamily = 'Arial, sans-serif';
    
    // Generate HTML content
    let htmlContent = `
      <div style="margin-bottom: 30px;">
        <h1 style="color: #1f2937; font-size: 28px; font-weight: bold; margin-bottom: 10px;">
          AI Generated MCQs
        </h1>
        <p style="color: #6b7280; font-size: 16px; margin-bottom: 20px;">
          ${mcqs.length} Multiple Choice Questions
        </p>
        <hr style="border: none; border-top: 2px solid #e5e7eb; margin: 20px 0;">
      </div>
    `;

    mcqs.forEach((mcq, index) => {
      htmlContent += `
        <div style="margin-bottom: 30px; page-break-inside: avoid;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
            <h3 style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 0; flex: 1;">
              ${index + 1}. ${mcq.question}
            </h3>
            <span style="background-color: ${
              mcq.difficulty === 'easy' ? '#dcfce7' : 
              mcq.difficulty === 'medium' ? '#fef3c7' : '#fee2e2'
            }; color: ${
              mcq.difficulty === 'easy' ? '#166534' : 
              mcq.difficulty === 'medium' ? '#92400e' : '#991b1b'
            }; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-left: 15px;">
              ${mcq.difficulty.toUpperCase()}
            </span>
          </div>
          
          <div style="margin-left: 20px;">
      `;

      mcq.options.forEach((option, optionIndex) => {
        const isCorrect = optionIndex === mcq.correctAnswer;
        htmlContent += `
          <div style="margin-bottom: 8px; padding: 12px; border-radius: 8px; ${
            includeAnswers && isCorrect 
              ? 'background-color: #dcfce7; border: 2px solid #16a34a;' 
              : 'background-color: #f9fafb; border: 1px solid #e5e7eb;'
          }">
            <span style="display: inline-block; width: 24px; height: 24px; border-radius: 50%; background-color: ${
              includeAnswers && isCorrect ? '#16a34a' : '#6b7280'
            }; color: white; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold; margin-right: 12px;">
              ${String.fromCharCode(65 + optionIndex)}
            </span>
            <span style="color: #1f2937; font-size: 14px;">
              ${option}
            </span>
            ${includeAnswers && isCorrect ? 
              '<span style="color: #16a34a; font-weight: bold; margin-left: 10px;">✓ Correct</span>' : 
              ''
            }
          </div>
        `;
      });

      if (includeAnswers && mcq.explanation) {
        htmlContent += `
          <div style="margin-top: 15px; padding: 15px; background-color: #f3f4f6; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <h4 style="color: #1f2937; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">
              Explanation:
            </h4>
            <p style="color: #4b5563; font-size: 13px; line-height: 1.5; margin: 0;">
              ${mcq.explanation}
            </p>
          </div>
        `;
      }

      htmlContent += `
          </div>
        </div>
      `;
    });

    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    // Convert to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // Remove temporary container
    document.body.removeChild(container);

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save the PDF
    const fileName = `MCQs_${new Date().toISOString().split('T')[0]}_${includeAnswers ? 'with_answers' : 'questions_only'}.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  }
};
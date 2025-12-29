// Mock jspdf
const mockSave = jest.fn();

export class jsPDF {
  save = mockSave;
  text = jest.fn();
  setFontSize = jest.fn();
  setFont = jest.fn();
  setTextColor = jest.fn();
  getTextWidth = jest.fn(() => 50);
  internal = {
    pageSize: {
      getWidth: () => 210,
      getHeight: () => 297,
    },
  };
}

export default jsPDF;

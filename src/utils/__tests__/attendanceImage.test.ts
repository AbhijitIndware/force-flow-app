import {
  getAttendanceImage,
  getBase64ByteSize,
  MAX_ATTENDANCE_IMAGE_BYTES,
} from '../attendanceImage';

describe('attendance image validation', () => {
  it('calculates the decoded Base64 size', () => {
    expect(getBase64ByteSize('SGVsbG8=')).toBe(5);
    expect(getBase64ByteSize('data:image/jpeg;base64,SGVsbG8=')).toBe(5);
  });

  it('accepts a complete image within the attendance limit', () => {
    expect(
      getAttendanceImage({
        type: 'image/jpeg',
        base64: 'SGVsbG8=',
        fileSize: 5,
      }),
    ).toEqual({
      image: {mime: 'image/jpeg', data: 'SGVsbG8='},
    });
  });

  it('rejects missing and oversized image data', () => {
    expect(getAttendanceImage(undefined)).toEqual(
      expect.objectContaining({error: expect.any(String)}),
    );
    expect(
      getAttendanceImage({
        type: 'image/jpeg',
        base64: 'SGVsbG8=',
        fileSize: MAX_ATTENDANCE_IMAGE_BYTES + 1,
      }),
    ).toEqual(expect.objectContaining({error: expect.any(String)}));
  });
});

/**
 * Minimal shape of a multer file.
 *
 * `@types/multer` is intentionally not a dependency, so the `Express.Multer.File`
 * namespace is unavailable — this local interface describes exactly the fields
 * this module uses with the default (in-memory) storage engine.
 */
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

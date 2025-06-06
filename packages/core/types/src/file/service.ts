import { IModuleService } from "../modules-sdk"
import { FileDTO, FilterableFileProps, UploadFileUrlDTO } from "./common"
import { FindConfig } from "../common"
import { Context } from "../shared-context"
import { CreateFileDTO, GetUploadFileUrlDTO } from "./mutations"

export interface IFileModuleService extends IModuleService {
  /**
   * This method uploads files to the designated file storage system.
   *
   * @param {CreateFileDTO[]} data - The files to be created.
   * @param {Context} sharedContext - A context used to share resources, such as transaction manager, between the application and the module.
   * @returns {Promise<FileDTO[]>} The created files.
   *
   * @example
   * const [file] = await fileModuleService.createFiles([{
   *   filename: "product.png",
   *   mimeType: "image/png",
   *   content: "somecontent" // base64 encoded
   * }])
   */
  createFiles(
    data: CreateFileDTO[],
    sharedContext?: Context
  ): Promise<FileDTO[]>

  /**
   * This method uploads a file to the designated file storage system.
   *
   * @param {CreateFileDTO} data - The file to be created.
   * @param {Context} sharedContext - A context used to share resources, such as transaction manager, between the application and the module.
   * @returns {Promise<FileDTO>} The created file.
   *
   * @example
   * const file = await fileModuleService.createFiles({
   *   filename: "product.png",
   *   mimeType: "image/png",
   *   content: "somecontent" // base64 encoded
   * })
   */

  createFiles(data: CreateFileDTO, sharedContext?: Context): Promise<FileDTO>

  /**
   * This method gets the upload URL for a file.
   *
   * @param {GetUploadFileUrlDTO} data - The file information to get the upload URL for.
   * @param {Context} sharedContext - A context used to share resources, such as transaction manager, between the application and the module.
   * @returns {Promise<UploadFileUrlDTO>} The upload URL for the file.
   *
   * @example
   * const uploadInfo = await fileModuleService.getUploadFileUrls({
   *   filename: "product.png",
   *   mimeType: "image/png",
   * })
   */

  getUploadFileUrls(
    data: GetUploadFileUrlDTO,
    sharedContext?: Context
  ): Promise<UploadFileUrlDTO>

  /**
   * This method uploads files to the designated file storage system.
   *
   * @param {GetUploadFileUrlDTO[]} data - The file information to get the upload URL for.
   * @param {Context} sharedContext - A context used to share resources, such as transaction manager, between the application and the module.
   * @returns {Promise<UploadFileUrlDTO[]>} The upload URLs for the files.
   *
   * @example
   * const [uploadInfo] = await fileModuleService.getUploadFileUrls([{
   *   filename: "product.png",
   *   mimeType: "image/png",
   * }])
   */
  getUploadFileUrls(
    data: GetUploadFileUrlDTO[],
    sharedContext?: Context
  ): Promise<UploadFileUrlDTO[]>

  /**
   * This method deletes files by their IDs.
   *
   * @param {string[]} ids - The IDs of the files.
   * @param {Context} sharedContext - A context used to share resources, such as transaction manager, between the application and the module.
   * @returns {Promise<void>} Resolves when the files are deleted successfully.
   *
   * @example
   * await fileModuleService.deleteFiles(["file_123"])
   */
  deleteFiles(ids: string[], sharedContext?: Context): Promise<void>

  /**
   * This method deletes a file by its ID.
   *
   * @param {string} id - The ID of the file.
   * @param {Context} sharedContext - A context used to share resources, such as transaction manager, between the application and the module.
   * @returns {Promise<void>} Resolves when the file is deleted successfully.
   *
   * @example
   * await fileModuleService.deleteFiles("file_123")
   */
  deleteFiles(id: string, sharedContext?: Context): Promise<void>

  /**
   * This method retrieves a file with a downloadable URL by its ID.
   *
   * @param {string} id - The ID of the file.
   * @param {FindConfig<FileDTO>} config - The configurations determining how the file is retrieved. Its properties, such as `select` or `relations`, accept the
   * attributes or relations associated with a file.
   * @param {Context} sharedContext - A context used to share resources, such as transaction manager, between the application and the module.
   * @returns {Promise<FileDTO>} The retrieved file.
   *
   * @example
   * const file = await fileModuleService.retrieveFile("file_123")
   */
  retrieveFile(
    id: string,
    config?: FindConfig<FileDTO>,
    sharedContext?: Context
  ): Promise<FileDTO>

  /**
   * This method is used to retrieve a file by ID, similarly to `retrieve`. It doesn't retrieve multiple files, but it's added to support retrieving files with [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query).
   *
   * @param {FilterableFileProps} filters - The filters to apply on the retrieved files.
   * @param {FindConfig<FileDTO>} config -
   * The configurations determining how the files are retrieved. Its properties, such as `select` or `relations`, accept the
   * attributes or relations associated with a file.
   * @param {Context} sharedContext - A context used to share resources, such as transaction manager, between the application and the module.
   * @returns {Promise<FileDTO[]>} The list of files. In this case, it will have at most one file.
   *
   * @example
   * const files = await fileModuleService.listFiles({ id: "file_123" })
   */
  listFiles(
    filters?: FilterableFileProps,
    config?: FindConfig<FileDTO>,
    sharedContext?: Context
  ): Promise<FileDTO[]>

  /**
   * This method is used to retrieve a file by ID, similarly to `retrieve`. It doesn't retrieve multiple files, but it's added to support retrieving files with [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query).
   *
   * @param {FilterableFileProps} filters - The filters to apply on the retrieved files.
   * @param {FindConfig<FileDTO>} config -
   * The configurations determining how the files are retrieved. Its properties, such as `select` or `relations`, accept the
   * attributes or relations associated with a file.
   * @param {Context} sharedContext - A context used to share resources, such as transaction manager, between the application and the module.
   * @returns {Promise<[FileDTO[], number]>} The list of files and their count. In this case, it will have at most one file.
   *
   * @example
   * const [files] = await fileModuleService.listAndCountFiles({ id: "file_123" })
   */
  listAndCountFiles(
    filters?: FilterableFileProps,
    config?: FindConfig<FileDTO>,
    sharedContext?: Context
  ): Promise<[FileDTO[], number]>
}

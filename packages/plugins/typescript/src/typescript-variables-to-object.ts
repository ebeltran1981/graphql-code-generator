import { OperationVariablesToObject, ScalarsMap, ConvertNameFn } from 'graphql-codegen-visitor-plugin-common';
import { TypeNode, Kind } from 'graphql';

export class TypeScriptOperationVariablesToObject extends OperationVariablesToObject {
  constructor(_scalars: ScalarsMap, _convertName: ConvertNameFn, private _avoidOptionals: boolean) {
    super(_scalars, _convertName);
  }

  private clearOptional(str: string): string {
    if (str.startsWith('Maybe')) {
      return str.replace(/^Maybe<(.*?)>$/i, '$1');
    }

    return str;
  }

  protected wrapAstTypeWithModifiers(baseType: string, typeNode: TypeNode): string {
    if (typeNode.kind === Kind.NON_NULL_TYPE) {
      const type = this.wrapAstTypeWithModifiers(baseType, typeNode.type);

      return this.clearOptional(type);
    } else if (typeNode.kind === Kind.LIST_TYPE) {
      const innerType = this.wrapAstTypeWithModifiers(baseType, typeNode.type);

      return `Maybe<Array<${innerType}>>`;
    } else {
      return `Maybe<${baseType}>`;
    }
  }

  protected formatFieldString(fieldName: string, isNonNullType: boolean, hasDefaultValue: boolean): string {
    if (hasDefaultValue || isNonNullType || this._avoidOptionals) {
      return fieldName;
    } else {
      return `${fieldName}?`;
    }
  }

  protected formatTypeString(fieldType: string, isNonNullType: boolean, hasDefaultValue: boolean): string {
    if (hasDefaultValue) {
      return this.clearOptional(fieldType);
    }

    return fieldType;
  }
}
